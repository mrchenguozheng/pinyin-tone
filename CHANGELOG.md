# Changelog

更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) | [如何维护更新日志](https://keepachangelog.com/zh-CN/1.0.0/),

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) | [语义化版本](https://semver.org/lang/zh-CN/).

## v3.0.0

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

- Breaking (behavior change): 新实现现在默认输出**规范**形式的 `ü`。`j`/`q`/`x`/`y` 与 `ü` 相拼时
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
- Fixed: 冒号不再被当成音节边界。`lu:e4` 此前整串原样返回（为了不切出 `lü é`），现在按
  一个音节处理：`lu:e4 → lüè`、`nu:e4 → nüè`、`lu:e → lüe`。冒号只是「这个 u 带两点」
  的标记，其后的字母仍属同一韵母。只有真的没处落点时才原样：音节里没有 `u`/`v`
  （`ma:1`、`ha:o3`）、零声母后不是单个 `u`/`v`（`u:e1`）、声母不能接 `ü`（`gu:1`）。

### Added

- Added: 转义 —— 片段前紧邻的反斜杠让这一段保持原样，反斜杠本身不进入输出：
  `hao3 \M2 货币供应量 → hǎo M2 货币供应量`。只作用于紧跟的那一段，同一句里该转的照转；
  这是「全大写拉丁串 + 数字」与拼音撞车（`A4`、`O2`、`M2`）时的出口。
  反斜杠只在真的挡住一次转换时才消失，所以 `C:\Users`、`\texttt`、`\ni3_hao3` 原样返回
  （后面那段本来就不转，没有东西可挡）。转义是一次性的：输出不带标记，再跑一遍仍会转。
  实现上片段正则多一个可选的前置反斜杠组，转义分支走与普通分支相同的边界判定 ——
  否则 `\ni3_hao3` 会被误判成「挡住了一次转换」而吃掉反斜杠。

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

- Changed: `package.json` 补上 `engines.node: ">=14.0.0"`。实现里唯一限制下限的语法是
  `convertToken` 里的 `??`（空值合并，Node 14.0 起支持）；命名捕获组与 `\p{Script=Han}`
  要 Node 10，`String.matchAll` 要 Node 12，`exports` 字段要 Node 12.7 —— 都不高于 14。
  此前没有这个字段，用 Node 12 安装不报错，跑起来才在 `??` 处抛语法错误。
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

## v2.4.0

2025-10-30

- Added: New function `convertUnspacedPinyin` to process unspaced pinyin strings into toned unspaced format.

## v2.3.5

2025-7-31

- chore: add sideEffects false to package.json
- updated: add test/ & tests/ to `.npmignore`

## v2.3.3

- Fixed: TypeScript type error TS2306
- Updated: add contributors in README.md

## v2.3.0

- BREAKING: Convert this package from a CommonJS package to an ES Module

## v2.2.7

- revert the changes: liou -> liou, yuen -> yuen

## v2.2.6 - deprecated, but the fixes was preseved in v2.2.7

- Fixed: strings that match the regex rule but are not present in pinyin_dict_v2 result in pinyin_dict_v2[match.groups.abc] being undefined.
- Fixed: 修复了匹配正则表达式的字符串但不在 pinyin_dict_v2 中的问题，导致 pinyin_dict_v2[match.groups.abc] 未定义。
- ~~Change: liou -> liu, yuen -> yun~~

## v2.2.2 - v2.2.5

2025-02-18

* Bumps the npm_and_yarn group with 2 updates: [serialize-javascript](https://github.com/yahoo/serialize-javascript) and [mocha](https://github.com/mochajs/mocha).
* Remove personal website link from `README.MD`.
* Change username of author's account on GitHub and update links.

## v2.2.1

2024-04-04

* Modify `README.md`.

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

* add support for tone mark 5.
* update devDependencies: `mocha` ^7.2.0 ->^9.1.3

## v2.0.7

2021-08-13

- Patched: `node_modules/glob-parent` 5.1.1 -> 5.1.2

```
glob-parent  <5.1.2
Severity: moderate
Regular expression denial of service - https://npmjs.com/advisories/1751
```

## v2.0.6

2021-05-21

- Added: `index.d.ts`: built-in TypeScript declaration.
- Patched
    - `node_modules/lodash`: `4.17.20` -> `4.17.21`
    - modify repository url in `package.json`.

## v2.0.4

2021-03-30

- Fixed
    * Upgrade `y18n` to v4.0.1 because the npm package `y18n` before version 3.2.2, 4.0.1, and 5.0.5 is vulnerable to Prototype Pollution.
    * 将`y18n`升级到v4.0.1因为3.2.2、4.0.1和5.0.5之前的版本易受原型污染。
- Upgrade
    * Upgrade `chai` to v4.3.4.
    * 将`chai`升级到v4.3.4。

## v2.0.0

2020-11-11

- Changed
    * Rewrite main code.
    * 重写了主要代码
    * Rewrite test.
    * 重写了测试。
- Fixed
    * Add /`ui`/.
    * 补上了/`ui`/。

## v1.2.2

- Changed
    * update dependencies to fix security alerts
    * 更新依赖，修复安全警告

## v1.2.0

- Changed
    * more tests.
    * 更多的测试。

## v1.1.0

2019-03-05

- Changed
    * add vowels `ü`/`ün`/`üe`/`üan` for mocha test.
    * 为mocha测试增加了`ü`/`ün`/`üe`/`üan`。
    * tone number allows `0` now.
    * 声调数字可以为`0`了。
- Added
    * add mocha test.
    * 增加了mocha测试。

## v1.0.0

2019-03-05

- Changed
    * repository changed.
    * update README.md

## v0.1.4

2019-02-27

- Fixed
    * update README.md. correct spellings.
    * 更新README.md。修正拼写。
    * add description in Simplified Chinese.
    * 增加简体中文描述。

## v0.1.3

2019-02-20

- Fixed
    * update README.md. correct spellings and urls.
    * 更新README.md。修正拼写和链接。

## v0.1.1

2019-02-18

- Fixed
    * missing `y` and `w`.
    * 缺少`y`和`w`
