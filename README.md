# pinyin-tone

Convert numeric tone notation (`hao3`) to Pinyin diacritics (`hǎo`). One function, no
dependencies; unspaced or mixed text needs no preprocessing.

[中文文档](https://github.com/mrchenguozheng/pinyin-tone/blob/master/docs/README.zh.md) · 中文版与 `docs/` 都不随 npm 包发布，只在仓库里

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

## Quick start

```bash
npm install pinyin-tone
```

Node.js 14 or later (`engines`). Both module systems work, and both need the named
`markTones` — **there is no default export**. `require()` resolves to `dist/index.cjs`,
which is generated from `lib/` at release time and compared against it entry by entry: the
same code, not a second copy.

Two dist-tags are published:

| Tag | Version | Install |
| --- | --- | --- |
| `latest` | 2.4.1 | `npm install pinyin-tone` |
| `next` | 3.0.0 | `npm install pinyin-tone@next` |

Plain `npm install` resolves to 2.x, whose entry point is `toPinyinTones` — 3.0 renamed that
function and dropped the default export. Nothing below applies to 2.x; read
[Migrating from 2.x](#migrating-from-2x) before switching, or pin the old behaviour with
`npm install pinyin-tone@2.4.1`.

```javascript
import {markTones} from 'pinyin-tone';          // ESM
const {markTones} = require('pinyin-tone');     // CommonJS

markTones('chu1 yin1 wei4 lai2');  // 'chū yīn wèi lái'
markTones('jv1 ju1 ju:1');         // 'jū jū jǖ'
markTones('今天ni3hao3');          // '今天nǐhǎo'
```

## API

```typescript
markTones(text: string, options?: {strict?: boolean, skip?: string | readonly string[]}): string
```

| Option | Type | Default | Effect |
| --- | --- | --- | --- |
| `strict` | `boolean` | `false` | Convert only the 426 syllables of Standard Mandarin, plus the erhua and literal `jv` spellings they determine |
| `skip` | `string \| readonly string[]` | none | Keep runs whose text equals an entry verbatim (case-sensitive) |

Both are optional; without them every run that resolves is converted. Anything else is
ignored — an unknown field, a `strict` that is not a boolean, a `skip` that is not a string
or an array — because an option should never change the algorithm by accident.

The name says what the call **does**, not what the package is: it **marks** pinyin you have
already written in ASCII (`hao3`, `jv`, `e^`) with tone marks. It does not turn Chinese
characters into pinyin, and does not guess a tone that was not written — `ma` stays `ma`.

## How a string is read

The input is scanned for runs of letters, `:`, `^` and digits `0`–`5`. Everything outside a
run — Chinese characters, punctuation, whitespace — is copied through untouched. Each run is
cut into syllables at its tone digits; a run that does not resolve as a whole is returned as
written, never half-converted.

```javascript
markTones('ni3hao3');         // 'nǐhǎo'    — the digit is the cut point
markTones('ni3,hao3');        // 'nǐ,hǎo'   — punctuation stays, both sides convert
markTones('hanyu3pin1yin1');  // unchanged  — nothing to cut at
markTones('今天ni3hao3');      // '今天nǐhǎo' — Chinese is not part of any run
markTones('ni3_hao3');        // unchanged  — reads as an identifier
```

Spacing is never added, removed or collapsed. Three things matter in practice:

- **A run with nothing to cut at is not guessed.** `hanyu3pin1yin1` has no digit inside
  `hanyu`, so it comes back as written.
- **A digit is not optional, except on a run's last syllable.** `ni3hao3ma` gives
  `nǐhǎoma`; `ni3haoma5` comes back as written.
- **To glue the output, do it at the call site.** `markTones(x).replace(/ /g, '')`, or put a
  `0` after a toneless syllable to separate without a space:
  `han0yu3pin1yin1` → `hanyǔpīnyīn`.

## Two spellings of `ü`

After `j`/`q`/`x`/`y`, both the standard spelling (`ju`) and the literal one (`jv`) are
accepted as input; output is always standard. `n` and `l` keep the distinction — `nv3` is
`nǚ`, `nu3` is `nǔ`.

A colon is the two dots themselves: `ju:1` gives `jǖ`. It sits right after the `u`/`v` it
belongs to, or at the end of the syllable; anywhere else the token comes back unchanged.

```javascript
markTones('jv1');          // 'jū'        — literal input, standard output
markTones('jv1 ju1 ju:1'); // 'jū jū jǖ'  — both spellings in one line
markTones('lu:e4');        // 'lüè'       — everything after the colon is the same final
```

## Mixed text

Chinese characters are not part of any run, so pinyin glued to them converts in place — no
preprocessing, no separate entry point.

```javascript
markTones('ju是规范写法，而ju:1是不规范写法');
// -> 'ju是规范写法，而jǖ是不规范写法'
```

A run glued to an ASCII word (`abcju1`, `ju1abc`) is left alone, and so is a bare `ju` with
no tone digit.

## Two things that bite

**All-caps Latin tokens collide with pinyin.** `M2`, `A4`, `O2` look like pinyin to this
library, because `m`, `a` and `o` are syllables on their own: `M2` becomes `Ḿ`, `CO2`
becomes `CÓ`. List the codes in `skip` and the text carries no marker characters at all:

```javascript
markTones('M2 货币供应量 hao3', {skip: 'M2'});  // 'M2 货币供应量 hǎo'
markTones('M2 A4 N3', {skip: ['M2', 'A4']});    // 'M2 A4 Ň'
```

`skip` compares the whole run, case-sensitively: `'M2'` cannot touch `M20` (a different run)
or `m2` (a different string).

**A rule covers every occurrence of that run.** `M2 M2` gives `M2 M2`, never one of each. If
a call needs both outcomes, cut the text and call once per part.

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

3.0 ships under the `next` tag while `latest` stays on 2.4.1, so a project depending on `^2`
does not jump a major version the next time it installs. Opt in with
`npm install pinyin-tone@next`, and go back by putting the version back to `2.4.1` or `^2`.

## Details

Edge cases live in [`docs/`](docs/); the README keeps to what most calls need.

- [`docs/edge-cases.md`](docs/edge-cases.md) — digits, `_`, spacing, a run that cannot be cut
- [`docs/case.md`](docs/case.md) — capitalisation, and why `CO2` becomes `CÓ`
- [`docs/uu.md`](docs/uu.md) — `ü`, the colon's legal positions, `ê`, the vowel-less interjections
- [`docs/strict.md`](docs/strict.md) — what `strict` lets through, and the 1,076 keys it rejects
- [`docs/skip.md`](docs/skip.md) — `skip` in full, including why `RegExp` is not accepted

Each page has a Chinese version — the same name with `.zh` before the extension. Neither
`docs/` nor the Chinese README is published to npm; they live in the repository.

中文：[docs/README.zh.md](https://github.com/mrchenguozheng/pinyin-tone/blob/master/docs/README.zh.md)

## Contributors

![Contributors](https://mrchenguozheng.github.io/pinyin-tone/CONTRIBUTORS.svg "Contributors")

## Contributing

Bugs and feature requests: [open an issue](https://github.com/mrchenguozheng/pinyin-tone/issues).

`npm test` runs mocha and `tsc --noEmit`; `npm run pack:check` verifies that the published
tarball contains exactly `lib/` and `dist/`. `dist/index.cjs` is generated from `lib/` by
`npm run build:cjs` — do not edit it by hand, and after changing anything in `lib/` run that
script and commit the result with the change (`npm test` fails if the committed copy drifted).

## Changelog

[CHANGELOG.md](https://github.com/mrchenguozheng/pinyin-tone/blob/master/CHANGELOG.md) lives
in the repository. It is not shipped in the npm package.

## License

MIT

## About 汉语拼音方案 (hàn yǔ pīn yīn fāng àn)

You can find the official document [汉语拼音方案.pdf] at
<http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html>

[汉语拼音方案.pdf]: http://www.moe.gov.cn/ewebeditor/uploadfile/2015/03/02/20150302165814246.pdf
