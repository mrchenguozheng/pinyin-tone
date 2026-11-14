# 发版

发版是一次打 tag，不是在某台机器上敲一条命令。推 `v<version>` 之后
`.github/workflows/publish.yml` 接手：重跑测试、检查包内容，然后带着 provenance 发布 ——
那份声明写明「这个包是这个 workflow、这个提交构建的」。

同一个 tag 也是「发过什么」的唯一记录，所以 `package.json` 里的版本和 tag 名必须一致，
workflow 不接受别的。

## 碰到 registry 之前先过的闸

| 闸 | 为什么要有 |
| --- | --- |
| tag 等于 `package.json` 的版本 | 否则一个版本号发了另一份代码 |
| tag 指向的提交在发布分支上 | 3.x 从 `master`，2.x 从 `maintain/2.x`；从旁支发版会绕过那条分支的 CI |
| 这个版本还没发布过 | npm 本来也会拒绝重发；在这里失败只是一行话，不是一串 HTTP 报错 |
| dist-tag | 3.x 发 `latest`，2.x 发 `legacy` —— 2.x 的补丁绝不该把默认安装拽回去 |
| `npm test` 与 `npm run pack:check` | tag 推送不触发 CI workflow，所以这个 job 是 tag 与 registry 之间唯一的关 |
| `npm publish --provenance` | 发布出来的包记录了产生它的 workflow 与提交，registry 上可验证 |

## 发 3.x

1. 改 `package.json` 的 `version`。
2. 把 CHANGELOG 的 `## 未发布` 改成 `## v<version>`，两处一起提交。
3. 在那个提交上 `git tag v<version>`，再 `git push origin v<version>`。
4. 看 Publish 这次运行：它会先打印解析出的 dist-tag、分支检查结果、包内容摘要，然后才发布。

## 发 2.x

同样的步骤，但走 `maintain/2.x`，两处不同：只发补丁版本（`2.5.3`，不发 `2.6`），dist-tag 是
`legacy` —— 由主版本号推导，所以 2.x 的 tag 不可能误发到 `latest`。2.x 收什么、不收什么，
见 [`maintenance.zh.md`](maintenance.zh.md)。

## 排练，不发布

手动运行这个 workflow，把 `dry_run` 保持为默认的打开状态，任意分支都可以。所有闸都会跑 ——
分支、dist-tag、版本是否已存在、测试、包内容 —— 最后一步是 `npm publish --dry-run`，它会打印出
将要上传的全部内容。唯一在分支上无法演练的是 tag 一致性，因为没有 tag。

「版本是否已存在」这道闸在排练里只警告、不退出：排练不碰 registry，而且排练的常态正是「这一版
已经发出去、下一版还没升」，把它当致命错误会让排练这条路在最需要的时候不可用。真发布时它仍然是
硬拦 —— `3.0.1` 已经在 registry 上，所以下一次真发必须先升到 `3.0.2`。

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

## 验证一次发布

```sh
npm view pinyin-tone dist-tags        # latest 是 3.x，legacy 是 2.x
npm view pinyin-tone@<version> dist.integrity
npm audit signatures                 # 检查已安装依赖的 provenance 声明
```

演示页把两条线都按精确版本钉住（原因见 `docs/` 与 `site/README.md`）；如果一次发版漏了改页面，
表现出来是 pin 过期，而不是安装坏了。
