# pinyin-tone

Convert numeric tone notation (`hao3`) to Pinyin diacritics (`hǎo`). One function, no
dependencies; unspaced or mixed text needs no preprocessing.

把 `hao3` 这类数字声调转成带调号的拼音 `hǎo`。一个函数，无依赖；连写与中英混排都能直接喂进去。

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

## Quick start

```bash
npm install pinyin-tone
```

Node.js 14 or later. Both module systems work; neither has a default export.

```javascript
import {markTones} from 'pinyin-tone';          // ESM
const {markTones} = require('pinyin-tone');     // CommonJS

markTones('chu1 yin1 wei4 lai2');  // 'chū yīn wèi lái'
markTones('jv1 ju1 ju:1');         // 'jū jū jǖ'
markTones('今天ni3hao3');          // '今天nǐhǎo'
```

中文：Node.js 14+，`import` 与 `require` 都能用，两边都要具名取 `markTones`（没有默认导出）。拼音串与中英混排都走同一个函数。

## API

```typescript
markTones(text: string, options?: {strict?: boolean, skip?: string | readonly string[]}): string
```

| Option | Default | Effect |
| --- | --- | --- |
| `strict` | `false` | Convert only the 426 syllables of Standard Mandarin, plus erhua and the literal `jv` spellings |
| `skip` | none | Keep runs whose text equals an entry verbatim (case-sensitive) |

Both are optional; without them every run that resolves is converted. Anything else is
ignored — an unknown field, a `strict` that is not a boolean, a `skip` that is not a string
or an array — because an option should never change the algorithm by accident.

中文：两个选项都可省略。`strict` 只放行普通话的 426 个音节（外加以它们为基底的儿化与字面 `jv` 写法）；`skip` 保持与声明一字不差的片段原样（区分大小写）。其余写法一律当没传——选项不该意外改变算法。

## How it reads a string

The input is scanned for runs of letters, `:` `^` and digits `0`–`5`. Everything outside a
run is copied through untouched; each run is cut into syllables at its tone digits. A run
that does not resolve as a whole is returned as written — never half-converted.

```javascript
markTones('ni3hao3');         // 'nǐhǎo'    — the digit is the cut point
markTones('ni3,hao3');        // 'nǐ,hǎo'   — punctuation stays, both sides convert
markTones('hanyu3pin1yin1');  // unchanged  — nothing to cut at
markTones('今天ni3hao3');      // '今天nǐhǎo' — Chinese is not part of any run
markTones('ni3_hao3');        // unchanged  — reads as an identifier
```

Spacing is never added, removed or collapsed. In practice, three things matter:

- **A run with nothing to cut at is left alone.** `hanyu3pin1yin1` has no digit inside
  `hanyu`, so it comes back as written rather than guessed.
- **A digit is not optional, except on a run's last syllable.** `ni3hao3ma` gives
  `nǐhǎoma`; `ni3haoma5` comes back as written.
- **To glue the output, do it at the call site.** `markTones(x).replace(/ /g, '')`. A `0`
  after a toneless syllable separates without a space: `han0yu3pin1yin1` → `hanyǔpīnyīn`.

中文：整段扫描「字母 / `:` / `^` / `0`–`5`」组成的片段，片段之外逐字照抄，片段内按数字切音节；认不全就整段原样，绝不半截。空格不增不删。三件实操要点：没有切点的片段（`hanyu3pin1yin1`）不猜；数字只有片段最后一段能省；要粘连就在调用方 `.replace(/ /g, '')`，或补 `0` 分隔而不产生空格。

## Two spellings of `ü`

After `j`/`q`/`x`/`y`, both the standard spelling (`ju`) and the literal one (`jv`) are
accepted. Output is always standard. `n` and `l` keep the distinction — `nv3` is `nǚ`,
`nu3` is `nǔ`.

A colon is the two dots themselves: `ju:1` gives `jǖ`. It sits right after the `u`/`v` it
belongs to, or at the end of the syllable; anywhere else the token comes back unchanged.

```javascript
markTones('jv1');       // 'jū'    — literal input, standard output
markTones('jv1 ju1 ju:1'); // 'jū jū jǖ' — both spellings in one line
markTones('lu:e4');     // 'lüè'   — everything after the colon is the same final
```

中文：`j`/`q`/`x`/`y` 之后的 `ü` 有规范（`ju`）与字面（`jv`）两种输入，输出一律规范形式；`n`/`l` 保持对立（`nv3` = `nǚ`，`nu3` = `nǔ`）。冒号就是那两点：`ju:1` → `jǖ`，它只能紧跟所属的 `u`/`v` 或缀在音节末尾，写在别处整串原样。

## Mixed text

Chinese characters are not part of any run, so pinyin glued to them converts in place — no
preprocessing, no separate entry point.

```javascript
markTones('ju是规范写法，而ju:1是不规范写法');
// -> 'ju是规范写法，而jǖ是不规范写法'
```

A run glued to an ASCII word (`abcju1`, `ju1abc`) is left alone, and so is a bare `ju` with
no tone digit.

中文：汉字不属于任何片段，紧贴着的拼音就地转换，不需要预处理也不需要另一个入口。粘在英文单词上的 `abcju1`/`ju1abc` 和没有声调数字的 `ju` 都不动。

## Errors you may need to fix

**All-caps tokens collide with pinyin.** `M2`, `A4`, `O2` look like pinyin to this library,
because `m`, `a` and `o` are syllables on their own: `M2` becomes `Ḿ`, `CO2` becomes `CÓ`.
List the codes instead — the rules are declarative, and the text carries no marker
characters:

```javascript
markTones('M2 货币供应量 hao3', {skip: 'M2'});  // 'M2 货币供应量 hǎo'
markTones('M2 A4 N3', {skip: ['M2', 'A4']});    // 'M2 A4 Ň'
```

中文：`M2`、`A4`、`O2` 这类「全大写拉丁串 + 数字」会与拼音撞车（`M2` → `Ḿ`、`CO2` → `CÓ`），因为 `m`、`a`、`o` 本身就是音节。用 `skip` 把这些码列出来即可，输入里不用写任何标记字符。

**A rule covers every occurrence of that run.** `M2 M2` gives `M2 M2`, never one of each.
If a call needs both outcomes, cut the text and call once per part.

中文：规则以片段为单位，覆盖它的每一次出现；一次调用里要两种结果就把文本切开分别调用。

## Migrating from 2.x

3.0 is the dictionary-based implementation that 2.x reached only through `pinyin-tone/v2`,
and it collapses the two 2.x entries into one: pinyin glued to Chinese no longer needs the
`Inline` variant. On the 13,664 inputs formed by every dictionary key × its seven tone
spellings, the two disagree on 11.3% — 3.0 fixes cases where the old one dropped letters
(`biou1`: 2.x gives `biū`, 3.0 gives `biōu`). Pin `pinyin-tone@2.4.1` if you need the old
output.

| 2.x | 3.0 |
| --- | --- |
| `pinyin-tone/v2` (alias) | the root entry |
| `import {v2} from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import toPinyinTones from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import {markSinglePinyinVowel} from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `pinyin-tone/workaround` | `markTones` (superset of its 36 inputs) |
| `toPinyinTones(x)` / `toPinyinTonesInline(x)` | `markTones(x)` — renamed and merged |
| `convertUnspacedPinyin(x)` | `markTones(x).replace(/ /g, '')` |
| `toPinyinTonesVariants(x)` | one colon per token that needs it |
| `pinyin-tone/v1`, `splitUnspacedSyllables(x)` | removed |

The 2.4.1 root entry had three names — a default export plus the named `v2` and
`markSinglePinyinVowel`. All three collapse into `markTones`, and getting the rename wrong is
loud rather than silent: 3.0 has no default export, so `import anything from 'pinyin-tone'`
is a syntax error, not an `undefined` you find in production.

中文：3.0 的根入口就是 2.x 里 `pinyin-tone/v2` 那份实现，并把两个入口并成一个（紧贴汉字不再需要 `Inline` 版本）。与 2.x 逐条对拍 13664 个输入，11.3% 不同——修的是旧实现丢字母（`biou1`：2.x 给 `biū`，3.0 给 `biōu`）。需要旧输出请锁 `pinyin-tone@2.4.1`。

2.4.1 根入口有三个名字（默认导出 + 具名 `v2`、`markSinglePinyinVowel`），全部并到 `markTones`。改漏了会当场报错：3.0 没有默认导出，默认导入是语法错误，不会留到线上变成 `undefined`。

## Further reading

Edge cases live in [`docs/`](docs/) — the README keeps to what most calls need.

- [`docs/edge-cases.md`](docs/edge-cases.md) — digits, `_`, spacing, a run that cannot be cut
- [`docs/case.md`](docs/case.md) — capitalisation, and why `CO2` becomes `CÓ`
- [`docs/uu.md`](docs/uu.md) — `ü`, the colon's legal positions, `ê`, the vowel-less interjections
- [`docs/strict.md`](docs/strict.md) — what `strict` lets through, and the 1,076 keys it rejects
- [`docs/skip.md`](docs/skip.md) — `skip` in full, including why `RegExp` is not accepted

Chinese summaries of each page are at the top of the file.

中文：边界情况移到了 [`docs/`](docs/)，README 只留多数调用需要知道的部分——数字与 `_` 的边界、大小写、`ü` 的两种拼写与冒号规则、`strict` 放行什么、`skip` 的完整语义。每页开头都有一段中文摘要。

## Contributors

![Contributors](https://mrchenguozheng.github.io/pinyin-tone/CONTRIBUTORS.svg "Contributors")

## Contributing

Bugs and feature requests: [open an issue](https://github.com/mrchenguozheng/pinyin-tone/issues).

`npm test` runs mocha and `tsc --noEmit`; `npm run pack:check` verifies that the published
tarball contains exactly `lib/` and `dist/`. `dist/index.cjs` is generated from `lib/` by
`npm run build:cjs` — do not edit it by hand, and after changing anything in `lib/` run that
script and commit the result with the change (`npm test` fails if the committed copy drifted).

中文：问题与建议请提 issue。`npm test` 跑 mocha 与 `tsc --noEmit`；`npm run pack:check` 校验包里只含 `lib/` 与 `dist/`。`dist/index.cjs` 由 `npm run build:cjs` 生成，不要手改；改了 `lib/` 要重新生成并一起提交，否则 `npm test` 会报它已过期。

## Changelog

[CHANGELOG.md](https://github.com/mrchenguozheng/pinyin-tone/blob/master/CHANGELOG.md) lives
in the repository. It is not shipped in the npm package.

中文：更新日志在仓库里，不随 npm 包发布。

## License

MIT

## About 汉语拼音方案 (hàn yǔ pīn yīn fāng àn)

You can find the official document [汉语拼音方案.pdf] at
<http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html>

[汉语拼音方案.pdf]: http://www.moe.gov.cn/ewebeditor/uploadfile/2015/03/02/20150302165814246.pdf
