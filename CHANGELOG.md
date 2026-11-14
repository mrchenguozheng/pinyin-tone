# Changelog

更新日志

All notable changes to this project are documented in this file.

- 格式参照 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) / [English](https://keepachangelog.com/en/1.0.0/)
- 版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/) / [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
- 3.0 之前只记版本与改动；3.0 起按 `Breaking` / `Added` / `Changed` / `Fixed` 分组
- 3.0 之前的条目保留当时的记录与原意，只统一日期写法、列表符号与中英对照的语序；每条日期取该版本
  tag 的日期

## 未发布

### 发布流程

- 发版从「本机敲一条 `npm publish`」改成「推一个 tag」。`v<version>` 推送后
  `.github/workflows/publish.yml` 依次跑 `npm test`、`npm run pack:check`，再校验 tag 与
  `package.json` 的版本一致、tag 是 annotated、提交落在发布分支上（3.x 在 `master`，2.x 在
  `maintain/2.x`）、registry 上还没有同号版本，然后按主版本号推导 dist-tag（3.x → `latest`，
  2.x → `legacy`）。补上两件原先没有的保证：tag 推送不触发 CI，因此这条 workflow 是发布前唯一的
  关；2.x 的补丁不可能被发到 `latest`。
- 认证只走 OIDC。npm 侧登记 trusted publisher（仓库 `mrchenguozheng/pinyin-tone`、workflow
  `publish.yml`、权限 `npm stage publish`），每次运行换一枚短期凭据。仓库里不存 token，也不该存：
  信任关系有效之后再放一个长期 token，等于在 staged 2FA 闸旁边留一扇多余的门。
- 发布走 staged publishing。这个权限下 CI 只能调 `npm stage publish`（`npm publish` 会被 registry
  拒绝），包先进 staging 区，由维护者在 npmjs.com 的 Staged Packages 里点 Approve 并完成 2FA 才
  上架。staged 与已发布版本共用同一个版本号唯一索引，忘了批准会让同号版本既上不了架、也不能再
  stage，得先 `npm stage reject`；短期 OIDC token 不能执行 `npm stage list/view/reject`，那几步要用
  维护者自己的身份。
- `publish.yml` 装 `npm@>=11.15.0 <12`。staged publishing 要求 npm 11.15.0 以上、Node 22.14 以上，
  而 12 又改了 `npm pack --json` 的输出形态，两个边界都要卡住。`registry-url` 一并去掉 ——
  setup-node 会借它写入一条 `always-auth`，npm 从 11 起对这条旧配置发警告。
- `npm pack --json` 的输出形态随 npm 大版本变化：11.21.2 是只含一项的数组，12.2.2 是以包名为键的
  对象。`check-pack.mjs` 原先用 `const [info] = JSON.parse(raw)` 解构，遇到对象形态就抛
  `object is not iterable` —— 第一次 Publish 运行正挂在打包守卫上。现在两种形态都接受
  （`scripts/pack-json.mjs`），多包、空结果、非对象则明确报错。
- 排练（手动触发、`dry_run` 默认打开）走同一条命令的 `--dry-run`，两道闸在这里放宽。版本已在
  registry 只警告，因为排练的常态正是「这一版已经发出去、下一版还没升」；npm 自己的重复版本检查
  绕不过，所以版本已存在时把工作副本临时改成 `0.0.0-rehearsal` 再跑，不提交、不打 tag。
- 防误发两道闸：真发布要求 annotated tag（`git cat-file -t` 校验，轻量 tag 直接拒绝，避免
  `git push --tags` 一次送上一串）；发布 job 挂 `npm-publish` environment，配好 required
  reviewers 后推 tag 只会排进等待批准。一次发布因此有三个必须由人做的动作：打 tag、批准
  environment、在 npmjs.com 批准 staged 版本。
- 三个 workflow 的 runner 写死 `ubuntu-26.04`。`ubuntu-latest` 从 2026-10-19 起分批迁往 Ubuntu 26，
  发布不可回滚、站点是对外页面，这两件事不该由一次没人审计过的系统换代决定；写死标签让平台变化
  成为一次显式改动。
- 三个 workflow 的 action 升到 Node 24 系列，消掉 `Node.js 20 is deprecated` 警告：
  `checkout@v4` → `v5`、`setup-node@v4` → `v5`、`configure-pages@v5` → `v6`、
  `upload-pages-artifact@v3` → `v5`、`deploy-pages@v4` → `v5`。判断依据是各 action 的 `action.yml`
  里 `runs.using` 是不是 node24，而不是发布先后（`configure-pages@v5` 仍跑 node20，v6 才是 node24）。
- 新增 `npm run release:ready`（`scripts/release-readiness.mjs`）：把「该不该发一版」从意见变成
  一次核对 —— 比对上一个 tag 之后 `lib/` 与 `dist/` 有没有变（包里只有这两样，它们没变就意味着
  发出去和上一版只差一个版本号），退出码 0 表示有东西可发、1 表示没有。

### 测试

- 17 行用例表搬进 `site/src/common/cases.json`，成为单一真源：演示页与 mocha 共读它，页面里不再
  有第二份手抄的用例。新增 `test/test-cases-fixture.js` 检查 1–17 无缺口、无重复 id、13–17 行
  确实没有 v1/v2 期望、每条 v3 期望对 `lib/index.js` 全真，并断言页面确实从这份 JSON 导入
  （出现内联用例数组或只存在于 fixture 的输入串就会红）。
- 新增 `test/test-divergence.js`：把 README 与 `docs/migrating.md` 引用的「13664 个输入、
  1548 个不同、11.3%」变成每次测试都重算的断言，并拆成 966 / 509 / 73 三桶各钉一条，防止
  「差异全朝一个方向」这套说法在数据变化后继续成立。另有两条钉住文档引用的样本
  （`biou1`、`jvn`）。同一文件里另加一段 `/v2` 对拍：259 个不同、38 个键、三行示例
  （`jv1`、`m1`、`e^1`）以及那 38 个键的完整成员表 —— 这几项原先只有人能核对。
- 新增 `test/test-doc-claims.js`：文档里引用的每个数字都先登记，再与代码对账（键数 1952、
  输入 13664、根入口差异 1548 及其三桶、`/v2` 的 259 / 38、`strict` 的 876 / 1076、
  `workaround` 的 42 种拼写）；同时扫描正文，凡是出现未登记的两位数以上整数就报出 `文件:行号`。
  代码片段与 URL 里的数字不计 —— 那些是输入输出与文档编号，不是对行为的断言。扫描范围含演示页
  正文：`site/src/pages/index.astro` 去掉 frontmatter、`<script>`、`<style>`、`<code>` 之后剩下的
  文字一并检查，页面里那句「426 个音节」因此不再是没人看守的第二副本。
- 新增 `test/test-pack-json.js`：`npm pack --json` 的两种输出形态各钉一条，另加多包、空结果与
  非对象三条拒绝断言。
- 对拍基线从 2.4.1 迁到 2.5.2：根 `devDependencies` 里的别名改为
  `"pinyin-tone-2": "npm:pinyin-tone@2.5.2"`（精确版本，别名是因为被测包自己就叫
  `pinyin-tone`）。根入口的统计与 2.4.1 完全一致；变化在 `/v2` 子路径 —— `e^1` 由 `e` 变成
  `e^1`（2.5.x 不再按切片截断），因此该测试还钉了一条行为断言 `v1('Hao3') === 'Hao3'`：
  把别名降回 2.4.1 这条立刻变红，基线版本从此不靠「装的是哪个」自证。

### 站点

- 表格改为按版本渲染，构建期逐格比对：声明了期望却不匹配的行直接让 `astro build` 失败
  （报 `#N v3: expected …, got …`），不再只是页面上一排 ✗。
- 单元格级失败显形：构建期与客户端都逐格 `try`/`catch`，某个版本调用抛错时该格渲染
  `✗ 抛错: <消息>` 并标红，而不是中断整行的渲染、让五格停在上一轮输入。
- `site/package.json` 的两条依赖改为精确 pin：`"pinyin-tone": "2.5.2"`、
  `"pinyin-tone-v3": "npm:pinyin-tone@3.0.1"`。页面在构建期读这份 `package.json`，把两条 pin
  印在版本卡片下方，README 里「记录而不是追 latest」这句话因此可在页面上核对；spec 不是
  `x.y.z` 就 throw，构建失败。
- `import v2 from 'pinyin-tone/v2/index.js'` 改为 `pinyin-tone/v2`：2.5.x 起包里有 `exports`
  map，`./v2/index.js` 这个文件路径不再解析，2.4.1 没有 `exports` 才能那样写。

### 文档与维护约定

- README、`docs/README.zh.md`、`docs/migrating.md`、`docs/migrating.zh.md`、`site/README.md`
  的推荐基线统一为 `pinyin-tone@2.5.2`（2.x 最后一个版本，npm 的 `legacy` 标签）。`2.4.1`
  已被作者标弃用，原文是：它的 `/v2` 入口按切片匹配，`Hao3` 给 `ao`、`toString` 给 `to`，
  2.5.0 才修掉 —— 文档不再让读者装它。
- 「11.3% 的差异全是旧入口吞字母」改成三桶归因（966 吞字母 / 509 根本没转换 / 73 等长的 ü
  拼写差），与 `test/test-divergence.js` 的断言同源。
- `docs/migrating.*` 的 `/v2` 对照表里 `e^1` 一行「2.x 侧」从 `e` 改成 `e^1`，原因也由
  「`^` 标 ê」改为「这种写法 2.x 不认」；对拍脚本的 `2.4.1`、`oldpin/v2/index.js` 一并更新。
- 本节之前 v3.0.1 与 v3.0.0 两节里仍写「2.4.1」的地方是当时发布时的记录（数字在 2.5.2 下
  依旧成立，差的是 `/v2` 的个别示例值），以上面这几条为准。
- 新增 `docs/releasing.md` 与 `docs/releasing.zh.md`：一份发版口径 —— 要不要发版的判据、碰到
  registry 之前要过的闸、发 3.x 与 2.x 的步骤、排练路径、npm 侧的一次性配置、发布后怎么验证
  （`dist-tags`、`dist.integrity`、`npm audit signatures`）。
- 新增 `docs/maintenance.md` 与 `docs/maintenance.zh.md`：3.0 在 `master`（`latest`）收功能与
  API 改动，2.x 在 `maintain/2.x`（`legacy`，固定 2.5.2）只收回归修复；修复先进 `master`，
  只有 2.x 自身的 bug 才回迁且只发补丁；`2.4.1` 保持弃用；回迁的改动必须在 2.x 那条分支的 CI
  上也绿。原先两条线怎么分工只存在于作者脑子里。
- 新增 `AGENTS.md`：给写代码的 agent 的维护须知 —— 目录分工、必须跑的命令、六条不变量及各自
  防住的事故（文档数字必须登记、数字改动要改全七处副本、用例表只有一份、pin 必须精确、2.x 只收
  回归修复、`dist` 是生成物）、已经踩过的坑（JSON import attribute 的版本限制、页面上
  `import.meta.url` 在预渲染时解析错位、`pinyin-tone-2` 是 2.5.2 而非 2.4.1、`strict` 对未知键不抛错、
  lock 里镜像地址要改回 npmjs）、每个数字怎么复算，以及完成标准。其中「一次发布需要哪些人工动作」
  与「该不该发版」的判据随发布流程一并写进去。
- 修正「`workaround` 是 36 个输入的超集」：那张表是 6 个元音 × 7 种写法（裸写与 `0`–`5`，
  其中 `0` 与 `5` 是两条独立输入），共 42 种拼写；`docs/README.zh.md` 与 README 一并改，
  `test-doc-claims.js` 逐条比对 `markTones` 与 `/workaround` 的输出，含非元音原样返回的兜底。

## v3.0.1

2026-11-12

这一版没有改代码，只有文档与测试。

### 文档

- 3.0 改为 `latest`。README 的安装命令从 `npm install pinyin-tone@next` 改回
  `npm install pinyin-tone`，原来说明「3.0 走 `next`、`latest` 停在 2.4.1」的那一段，
  改成「写着 `^2` 的项目不会自己跳过来，升级发生在你改 `package.json` 的时候」。
  中文版 `docs/README.zh.md` 同步改这两处。
- 新增 `docs/migrating.md` 与 `docs/migrating.zh.md`：逐个入口对过去的改名表、每个删掉的
  名字现在报什么错（含真实报错原文）、2.x 与 3.0 之间哪些输出变了，以及一段把自己的输入
  跟 2.4.1 对拍的脚本。
  - 对 2.4.1 的根入口：13664 个输入里 1548 个不同（11.3%），全是旧入口吞字母。
  - 对 2.4.1 的 `/v2`：259 个不同（1.9%），落在 38 个键上，分三组 —— `jv`/`qv`/`xv`/`yv`
    后面的 ü 写作 u（`jv1` 由 `jǖ` 变 `jū`，字面拼写改用 `ju:1`）、不带元音的叹词也标调
    （`m1` 由 `m1` 变 `m̄`）、`^` 只标 ê 不是声调（`e^1` 由 `e` 变 `ê̄`）。
- `test/test-example.js` 增加 `docs/migrating.md examples` 一组，把新文档里 3.0 那一列的
  输出钉住。

## v3.0.0

2026-10-19

### Breaking

- Breaking: 根入口 `pinyin-tone` 从 v1 换成基于词表的实现。此前默认导出的是 v1 的正则实现，
  要用新的那份得写 `pinyin-tone/v2`；现在根入口就是它。两者在 13671 个输入（词表全键 × 六个
  声调）上差异 11.3%，全部是 v1 把字母吞掉的旧问题（`biou1`：v1 给 `biū`，新实现给 `biōu`）。
- Breaking: v1 实现整体删除 —— `v1/` 目录、`pinyin-tone/v1`、`pinyin-tone/v1/index.js`
  都不再存在。3.0 只有一份实现，没有「新旧并存」这个状态：需要 v1 精确输出的调用方应锁在
  最后一个 2.x 版本（`pinyin-tone@2.4.1`），而不是在 3.0 里找开关。
  测试侧一并去掉了以 v1 为基准的对拍（`test-example.js` 的 v1 用例、`test-regex-anchoring.js`
  的两条全表对拍）——v1 不在包里以后它无法再充当对照。留下的独立期望值来源是
  `test/support/dict-values.js`（另写一套标调实现），以及全表的字母守恒、幂等、数量不变量。
- Breaking: `splitUnspacedSyllables` 与 `convertUnspacedPinyin` 一起删除，实现也不再保留。
  前者是后者的内部一步（把连写串按声调数字补上空格再喂回转换器），没有独立用途 ——
  连写输入 `markTones` 本来就接受；后者的「把输出粘起来」在调用方是一行
  `.replace(/ /g, '')`。随之一并消失的是它独有的「部分转换」行为：`hanyu3pin1yin1`
  以前得到 `hanyu3pīnyīn`（认得的段照转、`hanyu` 原样），现在按全或无的同一规则整串原样。
- Breaking: `toPinyinTonesVariants` 删除。它一次返回 `{canonical, literal}`，是唯一返回
  对象的入口，也是唯一「把整串切成字面拼写」的入口。字面形式从来不是一个全局选项，
  而是逐 token 用冒号请求（`ju:1 → jǖ`），`jv1 ju1 ju:1 → jū jū jǖ` 因此仍是一次调用可写。
  删之前用「裸写 / 冒号」两种输入对旧返回值的 canonical / literal 逐条复现，
  1952 键 × 7 种声调写法共 27328 项全部对得上，这不是能力丢失，只是把一个批量接口
  收回成 token 自带的写法。
- Breaking: `pinyin-tone/workaround` 子路径删除，连同 `markSinglePinyinVowel`。
  它是 2.x 的单字母查表（`a` / `o` / `e` / `i` / `u` / `v` × 无数字或 `0`–`4`，共 36 个输入），
  这 36 个输入 `markTones` 逐个给出同样的字符，且后者还多认 `a5` / `e5` / `v5`
  （旧表越界返回原串，转换器给 `a` / `e` / `ü`）。`workaround/` 目录、`exports` 里两条映射、
  `files` 白名单、`pack:check` 的必需项同步删除。
- Breaking: 公开面由此收敛为一个函数 —— `markTones`。
  删除前后对这两个入口做了 54968 次逐条对拍：全表 1952 键 × 7 种声调写法（无数字、
  `0`–`5`）× 裸写/冒号 × 严格模式开关，加上连写、标点、大小写、汉字混排、非法输入与
  边界空串，输出零差异。也就是说这一轮只删了入口，没动转换结果。
- Breaking: 两个入口最终合并成一个 —— `markTonesInText` 并入 `markTones`，
  同时改掉旧名：`toPinyinTones` / `toPinyinTonesInline` → `markTones`，
  公开类型 `PinyinTonesOptions` → `MarkTonesOptions`。
  依据是 29217 条输入的对拍：纯拼音场景（单音节全表 × 7 声调 × 裸写/冒号、空格分隔、
  双空格、tab/逗号/连字符分隔、英文前后粘连）两个入口逐条相同，`markTonesInText` 是超集；
  差异只有四类 —— 首尾空白 279 条、下划线分隔 178 条、汉字紧贴 85 + 85 条。
  合并后取 `markTonesInText` 的行为，逐条差异变成：首尾空白不再裁掉、`ni3_hao3` 不再转
  （`_` 是词字符，那串是标识符不是两个音节）、汉字紧贴着也照转。纯拼音 + 空格路径慢约
  12%（1.1MB：118.2ms → 132.4ms），换来只剩一条分词路径。`convertTokens`
  （`trim().split(' ')`）随之删除。
  旧名两头不靠：两个函数都不做汉字转拼音（生态里裸叫 `pinyin()` 的库一律指那个方向），
  `Tones` 是名词、没说什么动作，`Inline` 又是排版术语。新名是动宾结构，动词打头：
  词表只存无调形式，四个声调是运行时按落调规则现算的，这一步做的就是把声调数字换成
  那个字形 —— 给它**标**上调号，不是按声调给音节分类，也不涉及汉字。
  名字里不出现 `pinyin`：包名已经说过一次了，接口说的是自己那一步做了什么。
  3.0.0 从未发布，因此不留别名，2.x 的调用方改 import 即可。
- Breaking: 冒号的位置收紧为两种 —— 紧跟承载两点的 `u`/`v`，或缀在整个音节末尾。
  此前任意位置都收：`j:van1`、`jva:n1`、`jua:n1` 都给 `jüān`，因为实现把 `abc + after`
  拼回整串再查表，冒号只当「这个 token 要不要字面拼写」的开关，位置在分词阶段就丢了。
  合法的两种写法一个不变：末尾缩写 `ju:1` / `jvan:1`，紧跟承载位 `jv:an1` / `lu:e4`。
  错位的现在原样返回，与 `ma:1` 同类处理 —— 不替用户猜他想标的是哪一位。
- Breaking: 只提供**具名导出** `markTones`，没有 `export default`。
  默认导出时函数的公开名不在模块契约里（文档只能写「默认导出叫 `markTones`」这种间接说法），
  而且三条互操作路径都会露出来：`require()` 读到的是 `{default}`（要 `.default` 才拿到函数）、
  再导出得写 `export {default as markTones} from 'pinyin-tone'`、测试里 mock 也得按 `default`
  造形状。具名之后，import 写的名字、README 里的名字、补全插入的名字是同一个。
  代价只是少了一句「调用方随便命名」，用 `import {markTones as tones}` 就能补回来。
  3.0.0 未发布，因此不留 `export default` 兼容层 —— 同一个函数有两种取法，等于又造一个入口。
- Removed: 2.x 里 `v2/` 下 51 个按声母切分的内部词表（`v2/b.js`、`v2/zh.js`、`v2/special.js`
  等）合并为单文件 `lib/dict.js`，不再按声母拆分。这些文件从未出现在 README / CHANGELOG 中，
  也不构成有语义的公开接口；如果之前绕过文档直接 `import x from 'pinyin-tone/v2/b.js'`，
  升级后会得到 `ERR_PACKAGE_PATH_NOT_EXPORTED`。
  包内词表不提供任何受支持的访问入口：它的文件划分、表结构、键顺序都是实现细节，会随实现调整而变更。
- Changed: `package.json` 的 `exports` 字段把公开入口固定为 `.` 与 `./package.json`。
  其余子路径将解析失败。这同时意味着以后内部文件结构调整不会再意外破坏使用方，
  但任何新增子路径都需要同步声明。
  `main` / `types` 也一并指向 `lib/index.js` / `lib/index.d.ts`，根目录不再有转发文件。
- Changed: 包里不再包含 `CHANGELOG.md`。它 22.2KB（gzip 后 10.5KB），是包内 gzip 后第二大的文件，
  而 npm 页面不渲染它、这份文件在仓库里随时可查。`files` 因此只剩 `lib`，
  tarball 39.9KB → **30.9KB**（解包 104.3KB → 82.1KB，8 文件 → 7 文件）。
  `pack:check` 把 `CHANGELOG.md` 加进 FORBIDDEN，防止它被顺手带回来。
- Docs: README 新增 “Public API (公开接口)” 一节，明确只有上述入口受支持，并写明依赖包内私有
  路径会产生未定义、不可信的结果或报错，同时标注本次为 breaking change。

### Breaking (behavior change)

- 新实现现在默认输出**规范**形式的 `ü`。`j`/`q`/`x`/`y` 与 `ü` 相拼时
  《汉语拼音方案》要求省略两点，此前 `jv1 → jǖ`、`jvan1 → jüān` 这类输出保留了两点，属于
  不合规范的拼写。现在默认 `jv1 → jū`、`jvan1 → juān`。字面形式**不是**一个全局选项，而是
  写在需要它的那一处：`ju:1 → jǖ`（`jv:1` 同义）、`juan:1 → jüān`。
  `n`/`l` 不受影响（`nǚ`、`lǜ` 仍保留两点，那里 `u`/`ü` 是对立音位）。

- Breaking (behavior change): 分词规则放宽。一个 token 不再必须整个是单个音节，而是按
  **声调数字**切成若干段，每段各转一个音节 —— `ni3hao3 → nǐhǎo`、
  `han4yu3pin1yin1 → hànyǔpīnyīn`、`ni3hao3ma5 → nǐhǎoma`。输出保持输入的分隔方式：
  连写的音节之间不补空格，输入里写了的空格照留（`ni3 hao3 → nǐ hǎo`）。音节之间的
  ASCII 标点只作边界、原样保留：`ni3,hao3 → nǐ,hǎo`、`na3-li3 → nǎ-lǐ`、`hao3! → hǎo!`
  （此前这类输入整串原样返回，标点紧贴时连合法音节也不转）。token 内部的 `\n` / `\t`
  同样当边界。两道闸仍然挡住不该转的东西：任一音节认不出来就整串原样（`a1b2c3`、
  `ni3b2hao3`）、没有声调数字可切的地方不猜（`hanyu3pin1yin1` 里的 `hanyu`）。
  大写字母、非法声调、汉字混排仍整串不动。`markTonesInText` 同步支持连写
  （`今天ni3hao3 → 今天nǐhǎo`），粘在英文单词旁的片段依旧不动（`abcju1`、`ju1abc`、
  `abc_ju1`）。
  新增 `test/test-segmentation.js`（30 条）：连写 × 标点 × 边界 × 混排，并对 17 个音节
  做 289 组两两连写，断言「连写结果 === 分开写后去掉空格」；另有一条字母守恒断言
  （去掉声调符号后输入输出的字母序列必须完全相同），同时排除半截转换与错误多切
  （`lu:e4` 若被切成 `lü é`，或在音节之间塞了空格，都会当场变红）。
  `test-regex-anchoring.js` 的「整串匹配才转」策略随之更新：`expectNoPartial` 改为
  `expectNoLoss`，新增「声调符号数不超过输入数字数」。

- Breaking: 大写不再一律原样，改为按《汉语拼音正词法基本规则》(GB/T 16159—2012) §6.3
  的三种合法形态处理：全小写、首字母大写、全大写。形态按音节判定并原样带到输出 ——
  `Zhong1guo2 → Zhōngguó`、`BEI3JING1 → BĚIJĪNG`、`ni3Hao3 → nǐHǎo`、`LV4 → LǛ`。
  此前大写字母会打断片段，`Hao3` / `Zhong1Guo2` / `LV4` 全部原样：那是为旧正则打的补丁
  （只认 `[a-z]`，跳过大写后从中间开始匹配，`Hao3` 会变成 `ǎo`，H 被吃掉），副作用是
  正好否掉了标准里大写最常出现的那一类写法。§6.5 的标调规则没有为大写开口子 ——
  标准自己的全大写示例就带调号（`BĚIJĪNG`、`LǏ HUÁ`），所以 `Ě`/`Ī`/`Ǎ`/`Ǔ`/`Ǚ`/`Ế`
  都是既有字形，输出不需要拼组合符（只有 `ê` 的一声三声仍靠组合符，与小写一致）。
  音节内部混用（`hAo3`、`HaO3`）不是标准里的写法，仍整串原样。
  代价：全大写拉丁串 + 数字与拼音无法区分，`A4 → À`、`O2 → Ó`、`N3 → Ň`；输入以英文
  为主时应在调用方先转小写。
### Fixed (behavior change)

- 冒号不再被当成音节边界。`lu:e4` 此前整串原样返回（为了不切出 `lü é`），现在按
  一个音节处理：`lu:e4 → lüè`、`nu:e4 → nüè`、`lu:e → lüe`。冒号只是「这个 u 带两点」
  的标记，其后的字母仍属同一韵母。只有真的没处落点时才原样：音节里没有 `u`/`v`
  （`ma:1`、`ha:o3`）、零声母后不是单个 `u`/`v`（`u:e1`）、声母不能接 `ü`（`gu:1`）。

### Added

- Added: `markTones` 的第二个选项 `skip` —— 声明哪些片段保持原样，不必改输入文本：
  `markTones('M2 A4 N3', {skip: ['M2', 'A4']}) → 'M2 A4 Ň'`。只收字符串与字符串数组，
  比的是**整个片段**、区分大小写：`skip: 'M2'` 碰不到 `M20`（另一个片段），也碰不到 `m2`。
  规则以片段为单位，覆盖该片段的每一次出现 —— 一次调用里同一个片段只能有一种处置，
  要区别对待就把文本切开、分别调用。**不收 `RegExp`**：正则读起来是「在整段文本里找」，
  而规则只看得到单个片段 —— 环视（`(?<=今天 )`）拿不到前后字符、`^`/`$` 锚在片段两端
  而不是文本两端，两者都会「写得像对的、其实不生效」。**不收函数**：谓词会把声明式退回
  命令式，而它能表达的东西（某一次出现、上下文）无一不需要调用方先知道文本的结构。
  传了不认识的写法（`true`、`{}`、正则、函数、空数组）当没传，与 `strict` 一致：
  选项不该改变算法。

- Added: `ê`（欸 / 诶）可以输入了，写作 `e^` —— `^` 就是那个扬抑符，与 `u:` 用冒号表示两点
  是同一套办法：`e^ → ê`、`e^1 → ê̄`、`e^2 → ế`、`e^3 → ê̌`、`e^4 → ề`，不带数字或写 `0`/`5`
  都是轻声 `ê`。声调标在扬抑符上，`ế`（U+1EBF）与 `ề`（U+1EC1）是单个码位，`ê̄` 与 `ê̌`
  没有预组合字符，写成 `ê` + U+0304 / U+030C 两个码位。
  `^` 只认 `e`：`be^2`、`x^2`、`e^r` 一律原样，不做「把 `^` 挪到某个字母上」的猜测；
  `ê` 里没有 `u` 可标，所以它与冒号互斥（`e^:1` 原样）。连写与混排照常
  （`e^2e^4 → ếề`、`ni3e^2 → nǐế`），`{strict: true}` 也认它 —— `ê` 是《汉语拼音方案》
  里的一个韵母，不是 `e` 的变体。

- Added: `markTones` 与 `markTonesInText` 支持**冒号标记**：在 `u` 后写一个英文冒号
  表示这个 `u` 带两点，输出字面形式 —— `ju:1 → jǖ`、`juan:1 → jüān`、`jun:4 → jǜn`、
  `u: → ü`。冒号就是 `ü` 上面那两点，于是同一行里可以并排写出两种拼写
  （`ju1 ju:1 → jū jǖ`），而不需要给整串设一个开关；整段输入也就能全部用美式键盘敲出。
  冒号应当写在 `u` 上 —— `u` 就是那个要带两点的字母，文档与测试都以 `u:` 为准。若输入
  本来就已把 `ü` 写成 `v`，`jv:` 视为 `ju:` 的同义写法而不算错误（`v` 只是 `ü` 的 ASCII
  写法，再写冒号是同一件事说两遍，意思并不歧义）：`jv:1 → jǖ`、`jvan:1 → jüān`、
  `nv:3 → nǚ`、`v:1 → ǖ`。
  冒号生效与否只看有没有 `u`/`v` 可承载两点，不看声母：`gu:1 → gǖ`、`gv:1 → gǖ`、
  `shv:3 → shǚ`、`u:e1 → üē`。这些音节不合规范，但转换器不替调用方判断 —— 本包既输出
  规范拼写，也输出不规范拼写，写了冒号就是明确要求两点。
  只有两类落空：音节里没有 `u`/`v`（`ma:1`、`ha:o3`、`ji:1`）；或冒号落在 `u` 上、
  换成 `v` 之后词表那一格把 `v` 当辅音（`uang:1`、`shui:3`），输出里会冒出用户没写过的
  辅音字母 v，于是原样返回。冒号落在 `v` 上不属于落空 —— `v` 本来就是 `ü` 的 ASCII
  写法，这个冒号不带来任何新信息，视作没写：`vv:1` 就是 `vv1`（两者都是 `vǖ`，
  词表值是 `vü`，第二个 `v` 才是 `ü`），`vai:1` 与 `vai1` 同为 `vāi`。
  新增 `test/test-two-spellings.js`，用「换查表键」与「字符级替换」两套独立实现交叉验证
  32 个白名单音节 × 5 个声调，并对全表逐条断言投影不越界（假音节 `jui`/`jua`/`juo` 等
  80 条、`n`/`l` 的 16 条必须保持不变）。
- Added: `markTonesInText(text)` 转换**中文与拼音混排**的整句：不按空格切分，
  而是在整段里扫，只替换能成词的拼音片段，其余字符逐字保留。`markTones` 遇到
  `ju是规范写法` 这类粘连会整串原样返回，混排场景需要用它。
  裸写 `ju1` / `jv1` 输出规范形式 `jū`；`ju:1` 用英文冒号表示那个 `u` 上面的两点，输出
  字面形式 `jǖ`（`juan:1 → jüān`、`jun:4 → jǜn`），`jv:1` 取的是同一种写法；
  `u:` / `u:1` / `v:` / `v:1` 输出字符本身 `ü` / `ǖ`。
  新增 `test/test-inline.js`（31 条），覆盖混排核心用例、幂等性、边界（英文单词、
  前后紧邻 ASCII 字母、非法声调）、n/l 不受影响、全表逐条与 `markTones` 对齐。
- Added: `{ strict: true }` 选项，只认普通话的 **426** 个音节（另加 418 条儿化，由基底决定）。
  默认仍是宽容的：词表 1952 个键全部放行，包括 `jui`、`juang`、`juei`、`biong` 这类
  「声母 × 韵母」笛卡尔积的产物，`duang`、`biu` 这类非标准但在用的口语音，以及 `vai`
  这种把 `v` 当辅音的写法。`strict` 下它们整串原样（`jui1 → jui1`、`duang1 → duang1`），
  而 `ma1 → mā`、`huar1 → huār` 照常。儿化跟着基底走 —— `huar` 合法是因为 `hua` 合法，
  所以 418 条儿化一条都不用写进表里；`jv`/`jve`/`jvan`/`jvn` 先投影到
  `ju`/`jue`/`juan`/`jun` 再判，两种拼写在严格模式下表现一致（`jv1 → jū`）。
  全表 1952 键：放行 **876**、挡掉 **1076** —— 两条死键修好后从 1953 / 875 / 1078 变来
  （见下方 Fixed），1110 条笛卡尔积噪声里没有一条漏网。两个入口（`markTones`、
  `markTonesInText`）都接受该选项，默认 `false`，现有调用方看不到任何变化。
  新增 `lib/core.js`（426 条音节表：pypinyin 0.55.0 的 `pinyin_dict` 去调去重得 421 条，
  加 m/n/hm/hng 四条叹词，再加 `e^` 一条）与 `test/test-strict.js`（53 条）。
- Added: 叹词音节 `m`、`n`、`ng`、`hm`、`hng` 进词表（`ng` 原有，本次补齐其余四个）。
  它们没有元音，调号标在**最后一个鼻音**上：`m2 → ḿ`、`n2 → ń`、`ng4 → ǹg`、
  `hm2 → hḿ`、`hng1 → hn̄g`。
  其中 9 个形式有词典依据，字形逐条抄自 pypinyin 的 `pinyin_dict`（注音取自《现代汉语词典》
  一系）：`m1 → m̄`（嘸）、`m2 → ḿ`（呒呣唔嘸）、`m4 → m̀`（呣）；`n2 → ń`（咹哽唔嗯）、
  `n3 → ň`（㕶嗯）、`n4 → ǹ`（哏嗯）；`ng2 → ńg`、`ng3 → ňg`、`ng4 → ǹg`（都是「嗯」）。
  另外 11 个是**外推**，词典里没有：`m3 → m̌`（呣没有第三声）、`n1 → n̄`、`ng1 → n̄g`，
  以及 `hm`（噷）与 `hng`（哼）的全部四声 —— 这两个音节在词典里只有无调形式。
  实现上用 `NASAL_TONES` 把有依据的 9 个固定下来（含 `m̄` / `m̀` 这类两码位写法），
  查不到时按同一条规则补出其余组合，两种来源在输出上不作区分。
  两个实现细节值得记一笔。`m̄` / `m̌` / `m̀` / `n̄` 是「字母 + 组合符」两个码位（Unicode
  没有预组合字符），而 `TONE_MARKS` 原先是字符串按下标取，取到的是半个字符 —— `m2` 输出
  一度变成一个孤立的组合符 `̄`，改成数组才对。

### Changed

- Changed: 加上 CommonJS 入口。`import` 走 `lib/index.js`，`require()` 走 `dist/index.cjs`，
  `exports` 写成 `types` / `import` / `require` / `default` 四条条件（`default` 兜底给不认
  条件的工具链）。`dist/index.cjs` 不是手写的第二份实现，而是 `npm run build:cjs`
  把 `lib/{dict,core,index}.js` 逐字包裹成的单文件：三个模块各自包进 IIFE、`import` 换成
  读包裹结果、`export` 挂到 `module.exports`。之所以不引构建工具，是因为 `lib/` 里只有
  两条 `import` 与两条 `export`，没有 `import.meta`、没有动态 `import`，语法本身就是
  ES2020 —— 换一个打包器只会换来一份会随时间漂移的产物。
  产物进 git，且 `npm test`（`pretest`）与 `npm pack`（`prepack`）都会先跑 `--check`：
  与 `lib/` 不同步就直接失败，所以「改了源忘了重新生成」进不了仓库也发不了包。
  `test/test-cjs.js` 把两份实现钉在一起：35 条输入（连写、冒号两种位置、大小写三形态、
  汉字紧贴、数字断句、非法声调、`strict`/`skip` 四种组合）在 CJS 与 ESM 上输出逐字相同，
  并且 `require()` 回来的对象只有具名 `markTones`、没有 `default`。
  公开面两边一致：**没有默认导出**，两种加载方式都要具名取。
- Changed: `engines.node` 由 `">=14.0.0"` 改成 `">=14"`，含义不变（同一个下界，只是去掉
  `.0.0` 噪音）。这个下界现在是真的验过的：`scripts/smoke-entry.cjs` 把包打出来、装进一个
  干净工程，再让真实的 Node 分别走 `require` 与 `import` 两个条件 —— 在 v14.21.3 上
  两条都通。此前 `require()` 读 ESM 要 Node 22（或 20.19+），在 14/16/18 上直接抛
  `ERR_REQUIRE_ESM`；有了 CJS 入口，这个落差就没有了，`engines` 不必跟着抬高。
  CI 增加 `engines floor` job（Node 14 与 18），不装 devDependencies —— mocha 11 与
  chai 6 在这个版本上装不了，而这一步要证明的只是「包本身在这个 Node 上能用」。
- Changed: 包体从 31KB 涨到 57KB（gzip 后约 21KB → 24KB），多出来的是 74KB 的
  `dist/index.cjs`（gzip 24KB —— 词表是纯文本，压缩率很高）。`pack:check` 的
  `MAX_TARBALL` / `MAX_FILE` 双向 96KB 上调，并写明这是 CJS 产物的代价。
- Changed: 目录 `v2/` 改名为 `lib/`，`v1/` 直接删除。`v2` 这个前缀说的是「第二代实现」，
  与包版本无关，3.0 里再留着只会让人以为它是「版本 2 的那一份」；`lib` 不带版本含义，也不会
  和音节表 `lib/core.js` 撞名。连同 `pinyin-tone/v2`、`pinyin-tone/v2/index.js` 两个别名一起
  删掉 —— 根入口就是这份实现，别名没有语义；2.x 的 README 教过用户这样写，但保留一个同义的
  路径只会让「该用哪个」这个问题继续存在。这两个 import 现在抛
  `ERR_PACKAGE_PATH_NOT_EXPORTED`。

- Changed: `ng` 的四个声调不再原样返回。此前 `ng2` / `ng3` / `ng4` 都输出 `ng` ——
  `applyToneMark` 找不到元音就直接返回基底。现在它和 `m` / `n` / `hm` / `hng` 一样标在鼻音上，
  输出 `ńg` / `ňg` / `ǹg`，`ng1` 则是 `n̄g`。这是本次唯一一处既有行为的变化。

- Changed: `lib/dict.js` 的每个键只存**无调形式**，四个声调改由 `lib/index.js` 的 `applyToneMark`
  在运行时生成：有 `a` 标 `a`，无 `a` 有 `o` 标 `o`，无 `a`/`o` 有 `e` 标 `e`（`ê` 同 `e`，
  但它自带扬抑符、要单独查表），否则标最后一个元音（`iu → u`、`ui → i` 由此自动满足）。
  原因是 9760 条输出（1952 键 × 5 个声调）里有 7808 条（80%）是同一基底的机械变形，
  存 1 条 + 一条规则与存 5 条预生成字符串逐条等价 —— 已对全表逐键 × 5 个声调断言 0 差异，
  另有逐键 × 7 种输入形态（含冒号）的完整比对。
  `lib/dict.js` 由 110,310 字节降到 38,732 字节（gzip 31,120 → 10,638），公开行为不变：
  `markTones` 与 `markTonesInText` 的输出逐条相同（当时一并存在的另外两个入口，
  已在发布前删除，见上方 Breaking）。
  值仍逐键写出，不做「键把 `v` 换成 `ü`」的推导：74 个键的 `v` 是辅音字母（`va`、`vai`、
  `vong`、`vv`），派生会让它们变成 `üā` 这类不存在的音节；另一个例外是 `e^ → ê`。
  这 74 个键的基底因此原样保留，将来清理假音节时再一起处理。
  测试侧新增 `test/support/dict-values.js`：用一条正则（`/a|o|e|[iuü](?![aoeiuü])/`）
  独立实现标调，作为期望值来源，与生产代码的 `indexOf` 循环形成两套实现交叉验证。

- Refactor: 51 个分词表合并为单文件 `lib/dict.js`（1949 条），`lib/index.js` 由
  51 行 import + `Object.assign` 改为一行默认导入。键的插入顺序、每条 5 个声调值、
  43 处重复键的最终取值均与合并前逐字节一致，`markTones` 行为无变化。

### Fixed

- Fixed: 词表里的两条**死键** —— 存着数据，却没有任何输入能打到它。`e^` 从第二代实现的第一版起就躺在
  `lib/dict.js` 里（值 `ê`），而词法 `[a-z]+` 永远匹配不到 `^`，所以 `e^2` 一直原样返回；
  现在 `^` 成为 `e` 的可选后缀，这条键有了出口。另一条是 `'ü': 'ü'`，值与 `v` 完全重复、
  同样打不中，已删除（`v` 仍然给 `ü`：`v → ü`、`v1 → ǖ`、`nv3 → nǚ` 均不变）。
  词表因此从 1953 键降到 1952 键，严格模式放行 876、挡掉 1076。
- Fixed: 新增 `test/test-keys.js`，把「键必须打得中」钉成不变量：每个键加上声调数字都必须
  转换，且键只能是纯小写字母或 `e^`。此前 `test-inline.js` 与 `test-two-spellings.js` 的
  全表扫描都带着 `filter((k) => /^[a-z]+$/.test(k))`，把死键悄悄跳过 —— 断言照旧在跑，
  覆盖面已经少了两条而没有人知道。过滤已删除，现在整表都扫。
- Fixed (behavior change): 第二代实现的正则没有锚点，任何只被部分匹配的 token 都会被**静默截断**，
  不给任何提示：`ni3hao3 → nǐ`、`Hao3 → ǎo`、`ma6 → ma`、`hua1r → huā`、`a1b2c3 → ā`。
  现在整串必须完整匹配 `^[a-z]+[0-5]?$` 才会转换，认不全就原样返回（与 2.x 一致），
  不再输出半截结果。同时把 `5` 纳入合法声调——此前的字符类写成 `[01234^]`（`^` 应为 `5` 的
  笔误），导致 `ma5` 被当作 `ma` 处理；`0` / `5` / 缺省均按轻声取词表第 0 项。
  新增 `test/test-regex-anchoring.js`（206 条用例）覆盖截断、大写、标点、连写、非法声调、
  全音节表扫描与随机 fuzz。对既有输出有影响，建议与本次 breaking 同批发布。
- Fixed: `import ... from 'pinyin-tone/workaround'` 在 ESM 下报 `ERR_UNSUPPORTED_DIR_IMPORT`。
  这是缺少 `exports` 字段导致的既有问题，README 里给出的无扩展名写法此前在 ESM 下一直不可用。
- Fixed: `lib/index.d.ts` 声明的导出名 `unspacedPinyinSplit` 实际不存在，现更正为
  `splitUnspacedSyllables`；其返回类型也从 `string[]` 更正为 `string`。
- Fixed: `workaround/index.d.ts` 使用 `declare module '...'` 写法，
  导致 TS 报 TS2306（File is not a module），现改为正常的模块导出声明。
- Fixed: `tsconfig.json` 的 `include` 未覆盖任何 `.d.ts`，类型声明此前不参与 `tsc --noEmit`，
  上面两类错误因此长期未被发现。现已纳入，并新增 `test/fixtures-typescript/exports.ts`
  通过包自引用逐一校验各公开入口。

## v2.5.2

2026-11-12

运行时未变：`index.js`、`index.d.ts`、`v1/`、`v2/`、`workaround/` 与 `dist/` 与 2.5.0 逐字节相同，
变的只有 `README.md` 与 `version` 字段。

- 打包：包里不再带 `CHANGELOG.md` —— 那是 11,265 字节、npm 从不渲染的文件（包页面显示的是
  README），3.0 从一开始就没带它。67 个文件、84.7 KiB 的 tarball 变成 66 个、80.2 KiB。
  `scripts/check-pack.mjs` 现在按名字拒绝它，把它塞回 `files` 会失败，而不是悄悄把包做大。
- 文档：安装段不再写死版本号。2.5.1 那次写的是「装到的是 2.5.0」—— 那句话写于升版本之前，
  没有任何东西发现它，于是页面一边说装 2.5.1、一边说自己是 2.5.0。现在改说「最新的 2.x 版本」。

## v2.5.1

2026-11-12

运行时未变：除 `README.md` 与 `version` 字段外，包里每个文件都与 2.5.0 逐字节相同。

- 文档：安装段原先说普通 `npm install` 得到 2.4.1、3.0 挂在 `next` 标签下。两条都不再成立 ——
  普通安装给的是 3.0.1，2.x 发在 `legacy` 下，`next` 已经移除。
- 文档：v2 的 import 路径写反了。`exports` 从 2.5.0 起就有，能解析的是裸子路径 `pinyin-tone/v2`；
  README 教的 `pinyin-tone/v2/index.js` 会抛 `ERR_PACKAGE_PATH_NOT_EXPORTED`。两处现在都写裸子路径，
  2.5.0 的那条条目按当时发布的样子保留，不回头改写。
- 文档：README 原先写「2.3.0 及以后只发 ES module」，而 2.5.0 已经把 CommonJS 加回来了，现在说清
  两份产物同源、答案相同。
- 文档：changelog 链接指向 `master`，而那份副本停在 2.4.1、之后讲的是 3.x；现在指向 2.x 这条分支。

## v2.5.0

2026-10-19

- 新增：CommonJS 入口回来了。2.3.0 去掉 CommonJS 之后，2.2.x 及更早写的
  `const toPinyinTones = require('pinyin-tone')` 全部失效，这一版恢复可用，`import` 不受影响。
  `dist/index.cjs` 由同一份源码生成，两者在全部 122,802 个音节、声调与大小写组合上输出相同；
  它进 git，`pretest` / `prepack` 在源码改了却没重新生成时直接失败。
- 修：`v2` 的音节正则没有锚点，任何只被部分匹配的片段都会被静默截断 —— `Hao3` 给 `ǎo`、`aX1` 给
  `a`、`1ma` 给 `ma`、`ma1.5` 给 `mā`、`toString` 给 `to`。现在必须整段匹配，认不全就原样返回。
- 新增：首字母大写与全大写写法可以转换（`Hao3` → `Hǎo`、`MA1` → `MĀ`），此前会在字母大写处被切断。
  音节内部混用大小写（`hAo3`）不是一种拼写，仍原样返回。任何情况下都不再 `console.warn`。
- 修：轻声可以写 `5`，此前只认 `0` —— `ma5` 原样返回而 `ma0` 变成 `ma`，现在两者都是 `ma`。
- 修：`^` 曾被当成声调再丢掉（`parseInt('^')` 是 `NaN`，兜底把它读成轻声，`e^` 变成 `e`，而 v1
  给 `ê`）。表里没有 ê，这个标记不再被接受，`e^` 原样返回。
- 修：输入不再先 `trim` 再按单空格切分 —— 那样 `  ma1  ` 会丢掉空格，`ma1\nma2` 会整串原样返回且
  毫无提示。现在空白按原样保留，任何一段连续空白都算分隔，换行与制表符也能转。
- 修：`v1/index.d.ts` 与 `workaround/index.d.ts` 用 `declare module 'v1/index' {…}` 包裹，文件成了
  ambient script 而不是模块，使用方拿到 `TS2306: File … is not a module`；仓库自己的 `tsc` 因为
  `allowJs` 直接读 `.js` 而没看见。现在都是正常模块，并由 `tsconfig.types.json` 关掉 `allowJs` 复查。
- 修：`markSinglePinyinVowel` 用裸查表，`Object.prototype` 上的名字会被当成值返回
  （`'toString'` 返回内置函数、`'__proto__'` 返回对象），而声明说它返回字符串。现在先问表是否
  拥有该键。
- 修：`markSinglePinyinVowel('a5')` 原样返回，`'a0'` 却正常 —— 轻声只在一种写法下生效。现在六个
  元音都接受 `5`，与 v1 和 v2 一致。

备注：2.4.2 与 2.4.3 从未发布（registry 对两者都是 404），那批工作最终以 2.5.0 发出去。

## v2.4.1

2026-10-18

- Fixed: the published package no longer contains `CONTRIBUTORS.svg` (455 kB, over three quarters of the tarball) or `tsconfig.json`. A `files` whitelist in package.json now decides what gets packed: tarball 386 kB -> 43 kB, unpacked 596 kB -> 141 kB, 66 -> 63 files. No runtime change.
- Changed: the contributors image is no longer committed back to the repository. The workflow generates it with `noCommit` and publishes it to GitHub Pages; README uses the Pages URL.

## v2.4.0

2025-10-30

- Added: New function `convertUnspacedPinyin` to process unspaced pinyin strings into toned unspaced format.

## v2.3.5

2025-07-31

- chore: add sideEffects false to package.json
- updated: add test/ & tests/ to `.npmignore`

## v2.3.3

2025-05-03

- Fixed: TypeScript type error TS2306
- Updated: add contributors in README.md

## v2.3.0

2025-03-16

- BREAKING: Convert this package from a CommonJS package to an ES Module

## v2.2.7

2025-03-16

- revert the changes: liou -> liou, yuen -> yuen

## v2.2.6

2025-03-15

未单独发布：下面的修复保留到了 v2.2.7，被回退的那条改写也在 v2.2.7 里撤掉。

- Fixed: strings that match the regex rule but are not present in pinyin_dict_v2 result in pinyin_dict_v2[match.groups.abc] being undefined.
- Fixed: 修复了匹配正则表达式的字符串但不在 pinyin_dict_v2 中的问题，导致 pinyin_dict_v2[match.groups.abc] 未定义。
- ~~Change: liou -> liu, yuen -> yun~~

## v2.2.2 – v2.2.5

2025-02-18

- 依赖：npm_and_yarn 组里两条升级 —— [serialize-javascript](https://github.com/yahoo/serialize-javascript)
  与 [mocha](https://github.com/mochajs/mocha)。
- 文档：README 去掉个人网站链接。
- 仓库：作者 GitHub 账号改名，相关链接一并更新。

## v2.2.1

2024-04-04

- 文档：修改 `README.md`。

## v2.2.0

2023-04-23

- Patched: npm audit fix
- Feature: Add a `v2` version.

## v2.1.2

2022-01-26

- Patched: bump `nanoid` from `3.1.25` to `3.2.0`
```
nanoid  <3.1.31
Severity: moderate
Exposure of Sensitive Information to an Unauthorized Actor in nanoid - https://github.com/advisories/GHSA-qrpm-p2h7-hrv2
```

## v2.1.0

2021-11-02

- 支持声调数字 `5`（add support for tone mark 5）。
- 升级开发依赖：`mocha` ^7.2.0 → ^9.1.3。

## v2.0.7

2021-08-13

- Patched: `node_modules/glob-parent` 5.1.1 → 5.1.2

```
glob-parent  <5.1.2
Severity: moderate
Regular expression denial of service - https://npmjs.com/advisories/1751
```

## v2.0.6

2021-05-21

- Added: `index.d.ts` —— 内置 TypeScript 声明。
- Patched
  - `node_modules/lodash`: `4.17.20` → `4.17.21`
  - `package.json` 里的 repository url 一并修正。

## v2.0.4

2021-03-30

- Fixed
  - 升级 `y18n` 到 4.0.1：3.2.2、4.0.1、5.0.5 之前的版本存在原型污染（Prototype Pollution）。
- Upgrade
  - 升级 `chai` 到 4.3.4。

## v2.0.0

2020-11-11

- Changed
  - 重写主要代码（Rewrite main code）。
  - 重写测试（Rewrite test）。
- Fixed
  - 补上 /`ui`/。

## v1.2.2

- Changed
  - 更新依赖，修复安全警告（update dependencies to fix security alerts）。

## v1.2.0

- Changed
  - 更多的测试（more tests）。

## v1.1.0

2019-03-05

- Changed
  - 为 mocha 测试增加了 `ü`/`ün`/`üe`/`üan` 韵母。
  - 声调数字可以为 `0`。
- Added
  - 增加 mocha 测试。

## v1.0.0

2019-03-05

- Changed
  - 更换仓库地址（repository changed）。
  - 更新 `README.md`。

## v0.1.4

2019-02-27

- Fixed
  - 更新 `README.md`，修正拼写。
  - 增加简体中文描述。

## v0.1.3

2019-02-20

- Fixed
  - 更新 `README.md`，修正拼写与链接。

## v0.1.1

2019-02-18

- Fixed
  - 缺少 `y` 与 `w`。
