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

真发布只能从 tag 出发：在分支上关掉 `dry_run` 会被拒绝，这是故意的 —— 没有 tag 的发布在仓库里
留不下「发过什么」的记录，provenance 也会指向一个分支而不是一个版本。

## npm 上的一次性设置

发布用 npm 的 Trusted Publishing 认证，不存长期 token：在包页面的 settings 里添加一个
GitHub Actions 类型的 trusted publisher，仓库填 `mrchenguozheng/pinyin-tone`，workflow 文件名填
`publish.yml`。之后这个 workflow 拿到的 OIDC token 就是凭据，没有 secret 需要轮换。

在配置好之前，这个 job 读仓库 secret 里的 `NPM_TOKEN` 认证。第一次发布放一个 granular
automation token 进去，Trusted Publishing 生效后把它删掉 —— 一个不再使用的 secret 只是负担。

## 验证一次发布

```sh
npm view pinyin-tone dist-tags        # latest 是 3.x，legacy 是 2.x
npm view pinyin-tone@<version> dist.integrity
npm audit signatures                 # 检查已安装依赖的 provenance 声明
```

演示页把两条线都按精确版本钉住（原因见 `docs/` 与 `site/README.md`）；如果一次发版漏了改页面，
表现出来是 pin 过期，而不是安装坏了。
