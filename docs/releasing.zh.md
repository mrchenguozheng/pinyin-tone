# 发版

发版是一次打 tag，不是在某台机器上敲一条命令。推 `v<version>` 之后
`.github/workflows/publish.yml` 接手：重跑测试、检查包内容，然后带着 provenance 发布 ——
那份声明写明「这个包是这个 workflow、这个提交构建的」。

同一个 tag 也是「发过什么」的唯一记录，所以 `package.json` 里的版本和 tag 名必须一致，
workflow 不接受别的。

## 要不要发版

准备一份发版（改版本号、改 CHANGELOG 标题、提交、给出排练结果）可以由 agent 完成；`git tag -a`、
environment 批准、npmjs.com 上批准 staged 版本必须由维护者本人做 —— tag 是这里唯一撤不回的东西。

只有当 `## 未发布` 里至少有一条「装到这个包的人会看到不同结果」的改动，才值得发一版：

| 改动 | 版本 | 原因 |
| --- | --- | --- |
| 某个转换错了、API 没变 | 补丁，如 `3.0.2` | 用户拿到的字符串变了 |
| 新增选项或导出，旧行为不变 | 次版本，如 `3.1.0` | 只做加法，已装的代码不受影响 |
| 已有输入的转换结果变了，或导出 / `.d.ts` 签名变了 | 主版本，如 `4.0.0` | 已安装的代码可能坏 |
| 只动了 `docs/`、`test/`、`.github/`、`AGENTS.md`、`CHANGELOG.md` | 不发 | 用户什么也拿不到 |
| 2.x 的回归修复 | `maintain/2.x` 上的补丁，如 `2.5.3` | 不发 `2.6`，也不在 `master` 打这个 tag |

判断不能只凭感觉，这几条把它变成可核对的：

- 一个批次发一版，不是一次提交一版。纯文档的一周不构成一个版本号。
- 提出来之前先有证据：`npm test` 绿 + 一次排练（从 `master` 手动触发、`dry_run` 打开），并引用它
  打印的包内容摘要。没有这两样的「该发版了」只是意见。
- 核对到底有没有东西要发：跑 `npm run release:ready`。它比的是上一个 tag 之后 `lib/` 与 `dist/` 有
  没有变 —— 包里就这两样，它们没变，发出去和上一版只差一个版本号 —— 退出码 0 表示有、1 表示没有。
- 不要提一个 registry 上已有的版本号（`npm view pinyin-tone versions`），也不要在 `master` /
  `maintain/2.x` 之外的提交上打 tag —— 闸会拦，但白跑一次。

## 碰到 registry 之前先过的闸

| 闸 | 为什么要有 |
| --- | --- |
| tag 必须是 annotated tag | 轻量 tag 一条 `git tag v3.0.2` 就成立，`git push --tags` 还会一次送上一串；`-a -m` 多一道手，也留下打 tag 的时间与说明。本仓库只有 3 个早期的轻量 tag（`v2.0.3`、`v2.0.4`、`v2.3.5`，都已发布过、不会再走这条路），其余全是 annotated。 |
| 发布 job 要人点一次批准 | 仓库设置里给 environment `npm-publish` 配 required reviewers；配好之后推 tag 只会排进「等待批准」。没有保护规则的 environment 等于没有，所以这条要人工配置。 |
| tag 等于 `package.json` 的版本 | 否则一个版本号发了另一份代码 |
| tag 指向的提交在发布分支上 | 3.x 从 `master`，2.x 从 `maintain/2.x`；从旁支发版会绕过那条分支的 CI |
| 这个版本还没发布过 | npm 本来也会拒绝重发；在这里失败只是一行话，不是一串 HTTP 报错 |
| dist-tag | 3.x 发 `latest`，2.x 发 `legacy` —— 2.x 的补丁绝不该把默认安装拽回去 |
| `npm test` 与 `npm run pack:check` | tag 推送不触发 CI workflow，所以这个 job 是 tag 与 registry 之间唯一的关 |
| 维护者对 staged 版本点一次批准 | 本仓库的 trust relationship 权限是 `npm stage publish`：CI 只能把包放进 staging 区，上架必须由一个维护者在 npmjs.com 的 Staged Packages 里点 Approve（或本地 `npm stage approve <stage-id>`），那一步强制 2FA |
| `npm stage publish --provenance` | 发布出来的包记录了产生它的 workflow 与提交，registry 上可验证 |

## 发 3.x

1. 改 `package.json` 的 `version`。
2. 把 CHANGELOG 的 `## 未发布` 改成 `## v<version>`，两处一起提交。
3. 在那个提交上 `git tag -a v<version> -m "<一句说明>"`，再 `git push origin v<version>`。
4. 到 Actions 里批准那次 Publish 运行（没有配 required reviewers 时这一步不会出现）。
5. 看剩下的日志：它会先打印解析出的 dist-tag、分支检查结果、包内容摘要，然后 `npm stage publish`
   把包放进 staging 区。
6. 到 npmjs.com 的 Staged Packages 里审一眼这个版本的 SHASUM 与内容，点 Approve 并完成 2FA —
   **在这一步之前，registry 上看不到这个版本**。

第 6 步没做的话，同名版本既没上架也不能再 stage（staged 与已发布共用同一个版本号唯一索引）。
要撤销就把那条 staged 版本 Reject 掉，再重新来。OIDC 签发的是短期 token，它不能执行
`npm stage list/view/reject`，所以这件事只能在本地或网页上用维护者自己的身份做。

## 发 2.x

同样的步骤，但走 `maintain/2.x`，两处不同：只发补丁版本（`2.5.3`，不发 `2.6`），dist-tag 是
`legacy` —— 由主版本号推导，所以 2.x 的 tag 不可能误发到 `latest`。2.x 收什么、不收什么，
见 [`maintenance.zh.md`](maintenance.zh.md)。

## 排练，不发布

手动运行这个 workflow，把 `dry_run` 保持为默认的打开状态，任意分支都可以。所有闸都会跑 ——
分支、dist-tag、版本是否已存在、测试、包内容 —— 最后一步是 `npm stage publish --dry-run`，它会
打印出将要上传的全部内容。唯一在分支上无法演练的是 tag 一致性，因为没有 tag。

「版本是否已存在」这道闸在排练里只警告、不退出：排练不碰 registry，而且排练的常态正是「这一版
已经发出去、下一版还没升」，把它当致命错误会让排练这条路在最需要的时候不可用。

但 dry run 自己也会向 registry 查这个版本存不存在，重复版本它直接拒绝。所以排练
在这一步再退一层：版本已经在 registry 上时，把工作副本的版本临时换成 `0.0.0-rehearsal` 再跑
dry run（不提交、不打 tag）。这样排练验证的是机制 —— 认证方式、文件清单、dist-tag、
`--provenance` 是否被接受 —— 而不是版本号本身；仓库里的版本号一个字没改。

换了排练号之后，日志里的 `pinyin-tone-0.0.0-rehearsal.tgz` 是预期的，不代表要发这个名字。
真发布时「版本已有」仍然是硬拦：`3.0.1` 已经在 registry 上，所以下一次真发必须先升到 `3.0.2`。

真发布只能从 tag 出发：在分支上关掉 `dry_run` 会被拒绝，这是故意的 —— 没有 tag 的发布在仓库里
留不下「发过什么」的记录，provenance 也会指向一个分支而不是一个版本。

## npm 上的一次性设置

**仓库里什么都不存。** 仓库 secret 里没有 npm token，也不需要：发布用 npm 的 Trusted Publishing
认证，每次运行由它给这个 workflow 签发一枚短期凭据。

前提在 npm 那一侧，且只有包所有者能设：在包页面的 settings 里添加一个 GitHub Actions 类型的
trusted publisher，仓库填 `mrchenguozheng/pinyin-tone`，workflow 文件名填 `publish.yml`。之后
这个 workflow 拿到的 OIDC token 就是凭据，没有东西需要轮换，也没有东西会泄漏。

在那条登记存在之前，真发布会失败 —— workflow 的第一步就是把这件事说清楚（「既没有 OIDC 也没有
可用 token」），而不是让 npm 回一个看不懂的 HTTP 报错。如果你暂时不想用 Trusted Publishing，退路是
在仓库 secret 里放一个名为 `NPM_TOKEN` 的 granular automation token，发布步骤会用它。那种情况下
长期 token 就是凭据，所以 Trusted Publishing 配好后要立刻在 npm 上吊销它。

这条 trust relationship 的权限设的是 **`npm stage publish`**，不是 `npm publish`：workflow 只能
把版本放进 staging 区，不能让它上架 —— 所以每次发版都要以一次维护者批准加 2FA 收尾。这个权限下
CI 里的 `npm publish` 会被 registry 拒绝，workflow 因此调用 `npm stage publish`。

## 验证一次发布

```sh
npm view pinyin-tone dist-tags        # latest 是 3.x，legacy 是 2.x
npm view pinyin-tone@<version> dist.integrity
npm audit signatures                 # 检查已安装依赖的 provenance 声明
```

演示页把两条线都按精确版本钉住（原因见 `docs/` 与 `site/README.md`）；如果一次发版漏了改页面，
表现出来是 pin 过期，而不是安装坏了。
