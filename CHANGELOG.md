# Changelog

更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) | [如何维护更新日志](https://keepachangelog.com/zh-CN/1.0.0/),

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) | [语义化版本](https://semver.org/lang/zh-CN/).

## v2.5.0

2026-10-19

- Added: a CommonJS entry. 2.3.0 dropped CommonJS, so every `const toPinyinTones = require('pinyin-tone')` written against 2.2.x and earlier stopped working at that release. `require` now works again, and `import` is unchanged: `dist/index.cjs` is generated from the same sources and the two give identical output over all 122802 syllable, tone and capitalisation combinations. `v1`, `v2` and `workaround` are subpaths in both systems — `require('pinyin-tone/v2')` is callable and carries `convertUnspacedPinyin` and `splitUnspacedSyllables`, the way the ES module exports them. `dist/index.cjs` is committed and `pretest`/`prepack` fail when a source edit was not rebuilt, so what ships is what `git diff` shows.- Fixed: `v2`'s syllable pattern had no anchors, so it matched a slice of the input and discarded the rest. A piece that starts with anything other than a lower case letter lost its head and came back as the tail end of itself: `'Hao3'` -> `'ǎo'`, `'aX1'` -> `'a'`, `'1ma'` -> `'ma'`, `'ma1.5'` -> `'mā'`, `'toString'` -> `'to'`. The piece now has to match in full or it is returned untouched.
- Added: a syllable written with a capital (`'Hao3'` -> `'Hǎo'`, `'MA1'` -> `'MĀ'`) is converted instead of being cut at the capital. The three spellings are the all-lower, first-letter-capital and all-caps forms; mixed case inside one syllable (`'hAo3'`) is not a spelling, so it is returned untouched. Nothing is printed on `console.warn` in any case — a piece that comes back unchanged means it was left unchanged, and reporting it produced a line of noise for every brand name in the input.
- Fixed: the neutral tone can be written `5` as well as `0`, and only `0` was accepted. `'ma5'` came back untouched while `'ma0'` became `'ma'`; both now give `'ma'`.
- Fixed: `'^'` was accepted as a tone and then dropped, because `parseInt('^')` is `NaN` and the fallback read that as the neutral tone: `'e^'` became `'e'`, where v1 gives `'ê'`. The table has no ê entries, so the marker is no longer accepted and `'e^'` comes back as written.
- Fixed: the input was trimmed and split on single spaces, so `'  ma1  '` lost its spaces and `'ma1\nma2'` — one syllable per line — was returned untouched with no sign of trouble. Whitespace is now kept as written, and any run of whitespace separates pieces, so line breaks and tabs convert.
- Fixed: `v1/index.d.ts` and `workaround/index.d.ts` wrapped their declaration in `declare module 'v1/index' {…}`, which turns the file into an ambient script rather than a module. A consumer importing either path got `TS2306: File … is not a module`; the repository's own `tsc` run did not see it because `allowJs` read the `.js` instead. Both are plain modules now, checked a second time by `tsconfig.types.json` with `allowJs` off.
- Docs: the README's v2 import paths pointed at the directory (`'pinyin-tone/v2'`), which throws `ERR_UNSUPPORTED_DIR_IMPORT` — an ES module import needs the file name. They now read `'pinyin-tone/v2/index.js'`.
- Fixed: `markSinglePinyinVowel` (the `workaround` export) read its table with a bare lookup, so any name inherited from `Object.prototype` came back as a value instead of a miss: `markSinglePinyinVowel('toString')` returned the built-in function and `'__proto__'` returned an object, while the declaration says the function returns a string. It now asks the table whether it owns the key.
- Fixed: `markSinglePinyinVowel('a5')` returned `'a5'` where `'a0'` returned `'a'`, so the neutral tone worked only when written one way. `5` is now accepted for all six vowels, matching v1 and v2.
- Docs: the README said `v1` accepts `hua1r` and `v2` does not. Neither accepts it — both take `huar1` and hand `hua1r` back unchanged — so the paragraph now describes the difference that is actually there (full forms such as `liou` and `yuen`). The `liou2 yuen2` line also gave v2's output inside the v1 section.
- Changed, no behaviour: removed the `1r` and `0r` branches from v1's erhua handling. Its pattern is `(r[0-5]|[r0-5])?`, which cannot produce those orders; 40907 inputs give identical output before and after.
- Breaking: the output for the shapes in the first item changes — `'Hao3'` used to be `'ǎo'` and is now `'Hǎo'`, `'ma5'` used to come back as `'ma5'`, and `markSinglePinyinVowel('a5')` used to return `'a5'`. Nothing that converted correctly before changed: the 9730 syllable-and-tone combinations for tones 0-4 produce byte-identical output in 2.4.3 and 2.5.0, and the 1947 that changed are exactly the tone-5 entries that never converted.
- Known issue, not touched: the dictionary has 231 spellings that are not Mandarin syllables — the full forms (`'biou'`, `'buei'`, `'buen'`) and a `v`-initial family (`'va'`, `'vo'`, `'vi'`, `'vue'`, …), so `v2('va1')` gives `'vā'`. Against v1 this shows up as 1393 differing results over 11682 inputs, across 237 keys. Removing keys would change output for those inputs, and 3.0 handles it with a separate literal-spelling path, so 2.x leaves the table alone.

## v2.4.3

2026-10-19

- Fixed: `v2`'s three exports threw a `TypeError` on anything that is not a string — `toPinyinTones(undefined)`, `toPinyinTones(null)`, `toPinyinTones(42)` all crashed on `.trim()`. `v1` has always returned the argument untouched. This is a breaking change, which is why it is a second release rather than part of 2.4.2: code that calls v2 with an optional value and *relies on the throw* (wrapped in `try`, or with the argument always defined) now gets nothing back instead of an exception. Everything else keeps working — a string that cannot be converted is still returned as the same string.

## v2.4.2

2026-10-19

No runtime change: every input produces the same output as 2.4.1.

- Fixed: `v2/index.d.ts` declared `unspacedPinyinSplit(text): string[]`, a name `v2/index.js` never exported — it exports `splitUnspacedSyllables(text): string`. TypeScript accepted an import that failed on the call. The declaration and the type fixture now name what actually ships, and the old name is held out by `@ts-expect-error`.
- Added: `engines: {"node": ">=14"}`. The package declared no engines until now; 14 is the real floor for the `const` bindings in `v2/index.js`. A new CI job runs the packed tarball on node 14 and 18, where the test matrix (20/22/24) never reached.
- Changed: CI runs on `release/**` and `fix/**` as well as `master`, so a release branch gets checked from its first push.
- Docs: the README installation section says that a plain install is 2.4.x and that 3.0.0 lives under the `next` tag, with the three things that break 2.x callers.

## v2.4.1

2026-10-18

- Fixed: the published package no longer contains `CONTRIBUTORS.svg` (455 kB, over three quarters of the tarball) or `tsconfig.json`. A `files` whitelist in package.json now decides what gets packed: tarball 386 kB -> 43 kB, unpacked 596 kB -> 141 kB, 66 -> 63 files. No runtime change.
- Changed: the contributors image is no longer committed back to the repository. The workflow generates it with `noCommit` and publishes it to GitHub Pages; README uses the Pages URL.

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
