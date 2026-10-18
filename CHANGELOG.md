# Changelog

更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) | [如何维护更新日志](https://keepachangelog.com/zh-CN/1.0.0/),

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) | [语义化版本](https://semver.org/lang/zh-CN/).

## Unreleased

### Breaking

- Removed: `v2/` 下 51 个按声母切分的内部词表（`v2/b.js`、`v2/zh.js`、`v2/special.js` 等）不再发布。
  这些文件从未出现在 README / CHANGELOG 中，也不构成有语义的公开接口；如果之前绕过文档直接
  `import x from 'pinyin-tone/v2/b.js'`，升级后会得到 `ERR_PACKAGE_PATH_NOT_EXPORTED`。
  包内词表不提供任何受支持的访问入口：它的文件划分、表结构、键顺序都是实现细节，会随实现调整而变更。
- Changed: `package.json` 新增 `exports` 字段，公开入口被显式固定为
  `.`、`./v2`、`./v2/index.js`、`./v1`、`./v1/index.js`、
  `./workaround`、`./workaround/index.js`、`./package.json`。其余子路径将解析失败。
  这同时意味着以后内部文件结构调整不会再意外破坏使用方，但任何新增子路径都需要同步声明。
- Docs: README 新增 “Public API (公开接口)” 一节，明确只有上述入口受支持，并写明依赖包内私有
  路径会产生未定义、不可信的结果或报错，同时标注本次为 breaking change。

- Breaking (behavior change): v2 现在默认输出**规范**形式的 `ü`。`j`/`q`/`x`/`y` 与 `ü` 相拼时
  《汉语拼音方案》要求省略两点，此前 `jv1 → jǖ`、`jvan1 → jüān` 这类输出保留了两点，属于
  不合规范的拼写。现在默认 `jv1 → jū`、`jvan1 → juān`。需要字面形式请显式传
  `{ umlaut: 'keep' }`。`n`/`l` 不受影响（`nǚ`、`lǜ` 仍保留两点，那里 `u`/`ü` 是对立音位）。

### Added

- Added: `toPinyinTones` 与 `convertUnspacedPinyin` 新增可选第二参数 `{ umlaut }`，用于显式选择
  `j`/`q`/`x`/`y` 之后 `ü` 的拼写方式：
  - `'auto'`（默认）/ `'omit'`：规范形式，一律省两点，`jv1 → jū`、`ju1 → jū`；
  - `'keep'`：字面形式，一律保留两点，`ju1 → jǖ`、`jv1 → jǖ`。
  该选项只影响 `j`/`q`/`x`/`y`；`n`/`l` 后的 `ü` 在三种模式下都保留两点（`nǚ`、`lǜ`），
  因为那里的 `u` 与 `ü` 是对立音位（`nǔ` 努 / `nǚ` 女）。非法取值抛 `TypeError`。
  新增 `test/test-umlaut-style.js`（23 条），用「换查表键」与「字符级替换」两套独立实现
  交叉验证 32 个白名单音节 × 5 个声调 × 3 种模式，并对全表 1949 条断言投影不越界
  （假音节 `jui`/`jua`/`juo` 等 80 条、`n`/`l` 的 16 条在 `keep` 下必须保持不变）。
- Added: `toPinyinTonesVariants(text)` 一次返回 `{ canonical, literal }`，省掉调用方自己
  按 `omit` / `keep` 各调一次的样板代码。两者只可能差 `ü` 的两点，`n`/`l` 与不含 `ü`
  的音节两边相同（已对全表逐一断言）。

### Changed

- Refactor: `v2` 的 51 个分词表合并为单文件 `v2/dict.js`（1949 条），`v2/index.js` 由
  51 行 import + `Object.assign` 改为一行默认导入。键的插入顺序、每条 5 个声调值、
  43 处重复键的最终取值均与合并前逐字节一致，`toPinyinTones` 行为无变化。

### Fixed

- Fixed (behavior change): v2 的正则没有锚点，任何只被部分匹配的 token 都会被**静默截断**，
  不给任何提示：`ni3hao3 → nǐ`、`Hao3 → ǎo`、`ma6 → ma`、`hua1r → huā`、`a1b2c3 → ā`。
  现在整串必须完整匹配 `^[a-z]+[0-5]?$` 才会转换，认不全就原样返回（与 v1 一致），
  不再输出半截结果。同时把 `5` 纳入合法声调——此前的字符类写成 `[01234^]`（`^` 应为 `5` 的
  笔误），导致 `ma5` 被当作 `ma` 处理；`0` / `5` / 缺省均按轻声取词表第 0 项。
  新增 `test/test-regex-anchoring.js`（206 条用例）覆盖截断、大写、标点、连写、非法声调、
  全音节表扫描与随机 fuzz。对既有输出有影响，建议与本次 breaking 同批发布。
- Fixed: `import ... from 'pinyin-tone/v2'`、`'pinyin-tone/v1'`、`'pinyin-tone/workaround'`
  在 ESM 下报 `ERR_UNSUPPORTED_DIR_IMPORT`。这是缺少 `exports` 字段导致的既有问题，
  README 里给出的无扩展名写法此前在 ESM 下一直不可用。
- Fixed: `v2/index.d.ts` 声明的导出名 `unspacedPinyinSplit` 实际不存在，现更正为
  `splitUnspacedSyllables`；其返回类型也从 `string[]` 更正为 `string`。
- Fixed: `v1/index.d.ts`、`workaround/index.d.ts` 使用 `declare module '...'` 写法，
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
