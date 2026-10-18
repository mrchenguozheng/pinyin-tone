# pinyin-tone

A lightweight library to algorithmically convert numerical tone notation (e.g., hao3) to standard Pinyin diacritical marks (e.g., hǎo).

Designed for developers and learners who need accurate tone mark formatting in language apps, input methods, or educational tools.

## Setup

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

### Installation via npm:

通过NPM安装：

```bash
npm install pinyin-tone
```

Requires Node.js 14 or later (`package.json` → `engines`). The package is ESM-only
(`"type": "module"`), with no CommonJS build.

需要 Node.js 14 及以上（见 `package.json` 的 `engines`）；包只提供 ESM 入口（`"type": "module"`），
没有 CommonJS 版本。

## Public API (公开接口)

Only the entry point declared in `package.json` → `exports` is supported public API:

| Import path | Provides |
| --- | --- |
| `pinyin-tone` | `toPinyinTones` (default), `toPinyinTonesInline` |

**Everything else inside the package is private implementation.** Any other subpath is not
part of the API — including files you can see in `node_modules`, such as
`pinyin-tone/lib/dict.js`.

**Do not import those private paths.** Doing so yields undefined and untrustworthy
results: the files may be moved, renamed, or deleted in any release, and your code will
fail with `ERR_PACKAGE_PATH_NOT_EXPORTED` or `ERR_MODULE_NOT_FOUND`. The internal layout
of the dictionary — how it is split across files, its table shape, its key order — is
**not** a contract and changes without notice.

**3.0.0 is a breaking change**, in five places:

1. `pinyin-tone` now exports the dictionary-based converter that 2.x reached only through
   `pinyin-tone/v2`. On the 13,671 inputs formed by every dictionary key × six tones the two
   implementations disagree on 11.3% — 3.0 fixes cases where the old one dropped letters
   (`biou1`: 2.x gives `biū`, 3.0 gives `biōu`). **The old converter is no longer shipped**;
   if you need its exact output, pin the last 2.x release (`npm install pinyin-tone@2.4.1`).
2. The `pinyin-tone/v1` and `pinyin-tone/v2` subpaths are removed. `v1` is gone from the
   package entirely, and `v2` is the root entry now, so there is nothing left to alias. Both
   imports now throw `ERR_PACKAGE_PATH_NOT_EXPORTED`.
3. The `pinyin-tone/workaround` subpath is removed, together with `markSinglePinyinVowel`.
   All 36 inputs it handled (`a` / `o` / `e` / `i` / `u` / `v` × no digit or `0`–`4`) return
   the same character from `toPinyinTones`, which also handles the cases the old table left
   alone: `a5` → `a`, `e5` → `e`, `v5` → `ü`.
4. `convertUnspacedPinyin` is removed. `toPinyinTones` already accepts unspaced input and
   preserves whatever spacing the input had, so gluing the output is
   `toPinyinTones(x).replace(/ /g, '')` at the call site. The one thing that had no
   counterpart — converting the resolvable part of an unspaced run and leaving the rest
   (`hanyu3pin1yin1` → `hanyu3pīnyīn`) — is gone with it: a token that does not fully resolve
   is still returned as written, the same all-or-nothing rule as everywhere else.
5. `toPinyinTonesVariants` is removed, and `splitUnspacedSyllables` before it. The literal
   spelling is requested per token with `:`, which is what makes `'jū jǖ'` writable in a
   single call; there is no option — and now no second entry point — that switches a whole
   string to the literal spelling.

**中文说明：** 只有上表列出的入口是公开接口，包内其他任何路径（含 `lib/` 目录下的文件）
都属于私有实现，随时可能被移动、改名或删除。依赖它们会得到**未定义、不可信的结果或直接报错**。
3.0.0 的破坏性变更：根入口换成基于词表的实现（与 2.x 的旧实现在 13671 个输入上差异
11.3%，需要旧输出请锁在最后一个 2.x 版本 `pinyin-tone@2.4.1`）；`pinyin-tone/v1` 与
`pinyin-tone/v2` 两个子路径删除（v1 实现不再随包发布，根入口本身就是 v2 那份实现）；
`pinyin-tone/workaround` 子路径与 `markSinglePinyinVowel` 删除（它认的 36 个输入
`toPinyinTones` 逐个相同，且后者还多认 `a5` / `e5` / `v5`）；`convertUnspacedPinyin` 删除
（连写输入本来就接受，去空格是调用方一行 `.replace(/ /g, '')`）；`toPinyinTonesVariants`
与更早的 `splitUnspacedSyllables` 删除（字面拼写只由冒号逐 token 请求，没有整串开关）。
公开面因此收敛为两个函数：`toPinyinTones` 与 `toPinyinTonesInline`。

## Usage

This module exports a function. You can name it as desired, such as `pinyin`.

```javascript
import toPinyinTones from 'pinyin-tone';

// Examples
const hatsune_miku = toPinyinTones('chu1 yin1 wei4 lai2'); // 'chū yīn wèi lái'
const megurine_luka = toPinyinTones("xun2 yin1 liu2 ge1"); // 'xún yīn liú gē'
const han = toPinyinTones("han4 yu3 pin1 yin1 fang1 an4"); // 'hàn yǔ pīn yīn fāng àn'

// Erhua / 儿化音 (ér huà yīn)
const huar = toPinyinTones("huar1 renr2 shuir3 yuer4"); // 'huār rénr shuǐr yuèr'

// Initials / 声母 (shēng mǔ)
const bpmf = toPinyinTones("b p m f"); // 'b p m f'

// Finals / 韵母 (yùn mǔ)
const yun = toPinyinTones("an1 vn2 ong3 uen4"); // 'ān ǘn ǒng uèn'

// Special cases
const liuyun = toPinyinTones("liou2 yuen2"); // 'lióu yuén'
const iou_uen = toPinyinTones("iou1 uen4"); // 'iōu uèn' (pure final only)

// Some less common combinations
const fantastic = toPinyinTones("bong1 tv2 pe3 wir4"); // 'bōng tǘ pě wìr'
```

## How a token is read

**Input contract:** a token is split into syllables at its tone digits, and each syllable must be
a base form plus an optional diacritic marker (`^` for `ê`, `:` for a literal `ü` — both see
below) and an optional tone digit `0`–`5`. ASCII punctuation between syllables is kept as is.
If any piece does not resolve to a syllable, the whole token is returned unchanged — the
converter never returns a partially converted token:

```javascript
toPinyinTones('ni3hao3');        // 'nǐhǎo'   — one digit per syllable is enough to split
toPinyinTones('ni3 hao3');       // 'nǐ hǎo'  — a space in the input stays a space
toPinyinTones('ni3,hao3');       // 'nǐ,hǎo'  — punctuation stays, both sides convert
toPinyinTones('na3-li3');        // 'nǎ-lǐ'
toPinyinTones('a1b2c3');         // 'a1b2c3'  — b and c are not syllables, nothing is touched
toPinyinTones('hanyu3pin1yin1'); // unchanged — "hanyu" has no digit to cut at
```

Spacing is never added or removed: syllables written together come back together, syllables
written apart keep their space — including extra ones. If you want the output glued together
regardless of how the input was spaced, strip the spaces at the call site; there is no second
function for it. See [Unspaced input](#unspaced-input).

Uppercase letters, a tone digit outside `0`–`5`, and CJK characters still make the whole token pass
through untouched (use `toPinyinTonesInline` for text that mixes Chinese and pinyin).

**Two spellings for `ü` after `j`/`q`/`x`/`y`.** Both the standard form (`ju`, `jue`, `juan`,
`jun`) and the literal form (`jv`, `jve`, `jvan`, `jvn`) are accepted as input. Output is always
the **standard** form — after `j`/`q`/`x`/`y` the *Scheme for the Chinese Phonetic Alphabet*
requires dropping the diaeresis:

```javascript
import toPinyinTones from 'pinyin-tone';

toPinyinTones('jv1');   // 'jū'  — literal input, standard output
toPinyinTones('ju1');   // 'jū'  — standard input, standard output
```

To keep the diaeresis at one particular place, write a colon after the `u`. The colon is the
two dots themselves, and the `u` is the letter they sit on:

```javascript
toPinyinTones('ju1 ju:1');   // 'jū jǖ'   — both spellings in one line
toPinyinTones('juan:1');     // 'jüān'
toPinyinTones('jun:4');      // 'jǜn'
```

The marker belongs on the `u`; that is the only letter it is asking about. `v` is the ASCII
spelling of `ü`, though, so `jv:1` says the same thing and is accepted as a synonym for `ju:1`
(`'jǖ'`). Write the `u` form unless you are feeding in text that already spells `ü` as `v`.

There is no option that switches a whole string to the literal spelling — the colon marks one
token, which is what makes both spellings writable in a single call:

```javascript
toPinyinTones('jv1 ju1 ju:1');   // 'jū jū jǖ'
```

Write the colon at each place you want the diaeresis. If you need the two spellings side by
side for a longer text, call the converter twice — once with the plain input, once with a
colon added to the syllables you want dotted. There is no entry point that returns both.

The colon asks for `ü`, not for a syllable that happens to exist, so it does not check the
initial: `gu:1` gives `gǖ`, `shv:3` gives `shǚ`, and `u:e1` gives `üē`. None of those are valid
syllables, and rendering them is the point — this package also exists to put non-standard
spellings next to standard ones, so a written colon is taken at face value. It declines only
when there is no `u`/`v` in the syllable to carry the dots (`ma:1`, `ha:o3`, `ji:1`), or when the
`u` it would replace is read as a consonant `v` by that entry and a literal `v` would appear in
the output (`uang:1`, `shui:3`). Those come back unchanged.

A colon on a `v` is not a request at all: `v` already is the ASCII spelling of `ü`, so `jv:1` is
read exactly like `ju:1`. When that leading `v` is a consonant in the entry, the colon simply
adds nothing and `vv:1` is `vv1` — both `vǖ`, because the entry's value is `vü`, where the second
`v` is the `ü`. Likewise `vai:1` and `vai1` are both `vāi`.

`n`/`l` never take part in this projection: there `u` and `ü` are distinct sounds, so `nv3` is
`nǚ` and `nu3` is `nǔ` — the spelling you type is the sound you get. `nu:3` also gives `nǚ`, but
that is an explicit request for the diaeresis rather than a projection.

> `jǖ` is not a second *valid* spelling — GB/T 16159 and the *Scheme for the Chinese Phonetic
> Alphabet* require omitting the diaeresis after `j`/`q`/`x`. This package can still render the
> literal form because it is also used to show how the two spellings differ, and because `jv`
> is the ASCII input convention for `ü`. In normal output you should never see `jǖ` unless you
> asked for it with `:`.

### `ê` (欸 / 诶)

`ê` is a rime of its own, not an `e` carrying a tone mark. It is written `e^`: the caret **is**
the circumflex, the same trick as the colon for `ü`, so the whole input stays typeable on a US
keyboard.

```javascript
toPinyinTones('e^');    // 'ê'
toPinyinTones('e^1');   // 'ê̄'
toPinyinTones('e^2');   // 'ế'
toPinyinTones('e^3');   // 'ê̌'
toPinyinTones('e^4');   // 'ề'
```

The caret belongs to `e` and to nothing else: `be^2`, `x^2` and `e^r` come back untouched rather
than having the caret moved onto some other letter. It is also mutually exclusive with the colon
— `ê` has no `u` to carry the diaeresis, so `e^:1` is left alone.

The tone mark sits on top of the circumflex. `ế` (U+1EBF) and `ề` (U+1EC1) are single code
points; `ê̄` and `ê̌` have no precomposed character and are written as `ê` plus U+0304 / U+030C.

### Interjections without a vowel

`m`, `n`, `ng`, `hm` and `hng` are in the dictionary too — 呣 / 嗯 / 噷 / 哼. They have no vowel
to carry the tone mark, so it goes on the **last nasal**:

```javascript
toPinyinTones('m2');    // 'ḿ'
toPinyinTones('n2');    // 'ń'
toPinyinTones('ng4');   // 'ǹg'
toPinyinTones('hm2');   // 'hḿ'
toPinyinTones('hng1');  // 'hn̄g'
```

Nine of the twenty possible forms are the ones a dictionary actually lists, and those are spelled
exactly as the entry is: `m̄` (嘸), `ḿ` (呒呣唔嘸), `m̀` (呣), `ń` / `ň` / `ǹ`, `ńg` / `ňg` / `ǹg`.
The rest — `m3`, `n1`, `ng1`, and all four tones of `hm` / `hng` — are not dictionary entries; they
are produced by the same rule, so `toPinyinTones('m3')` is `'m̌'`. The output does not distinguish
the two groups.

Note that `m̄`, `m̀`, `m̌` and `n̄` are two code points each (`m` / `n` + U+0304 / U+0300 / U+030C) —
those have no precomposed character. `ḿ`, `ń`, `ň` and `ǹ` are single code points.

### Strict mode

The dictionary is deliberately permissive: 1952 keys, of which only 426 are syllables of Standard
Mandarin (plus 418 erhua forms, which are derived from them at lookup time). The remaining 1076 are
products of an initial × final cross product (`jui`, `juang`, `juei`, `biong`), non-standard but
real-world spellings (`duang`, `biu`, `rua` is standard, `biong` is not), or `v` used as a
consonant (`vai`, `bvan`). All of them convert by default:

```javascript
toPinyinTones('jui1');    // 'juī'
toPinyinTones('duang1');  // 'duāng'
```

Pass `{ strict: true }` to accept only the 426 syllables and their erhua:

```javascript
toPinyinTones('jui1', {strict: true});    // 'jui1'   — not a syllable, left alone
toPinyinTones('duang1', {strict: true});  // 'duang1'
toPinyinTones('ma1', {strict: true});     // 'mā'
toPinyinTones('huar1', {strict: true});   // 'huār'   — hua is a syllable, so huar is too
toPinyinTones('e^2', {strict: true});     // 'ế'      — ê is a rime of its own
```

Erhua is decided by its base: `huar` is valid exactly because `hua` is. The literal spellings
`jv`/`jve`/`jvan`/`jvn` are projected onto `ju`/`jue`/`juan`/`jun` before the check, so they behave
the same in both modes. A rejected syllable makes the whole token pass through unchanged — the same
all-or-nothing rule as everywhere else.

The option is accepted by both entry points (`toPinyinTones`, `toPinyinTonesInline`). It
defaults to `false`, so existing callers see no change.

### Mixing pinyin into Chinese text

`toPinyinTones` splits on spaces, so a sentence with pinyin glued to Chinese characters
(`ju是规范写法`) is returned untouched. Use `toPinyinTonesInline` for mixed text — it scans the
whole string and replaces only the pinyin fragments, leaving every other character as-is:

```javascript
import { toPinyinTonesInline } from 'pinyin-tone';

toPinyinTonesInline('ju是规范写法，而ju:1是不规范写法，因为u:1在j后面要省略上面的两点');
// -> 'ju是规范写法，而jǖ是不规范写法，因为ǖ在j后面要省略上面的两点'
```

Bare tokens follow the same default as `toPinyinTones` — the standard spelling, so `ju1` and
`jv1` both give `jū`. To ask for the literal form at one particular place, put a colon right
after the `u`: `ju:1` gives `jǖ`, `juan:1` gives `jüān`, `jun:4` gives `jǜn` (`jv:1` is the same
request written with the `v` spelling of `ü`, and gives `jǖ` too). The colon stands for the two dots above `ü`, so the
whole sentence can be typed on a US keyboard — every non-ASCII character is produced by the
converter, none has to be typed.

Note that the bare `ju` in that sentence stays `ju`: it is not a syllable with a tone number, so
it is left as written. Add a tone number (`ju1`) if you want it converted.

The colon does not end the syllable — whatever follows it is still part of the same final, so
`lu:e4` is `lüè` (`l` + `üe`, fourth tone), not `lü` + `é`. It fires wherever a `u`/`v` is there
to carry the dots, even when the resulting syllable does not exist (`gu:1` → `gǖ`, `u:e1` →
`üē`). It declines only when the syllable has no `u`/`v` at all (`ma:1`, `ha:o3`) or when the `u`
it replaces would land on a `v` the entry reads as a consonant (`uang:1`, `shui:3`); those come
back unchanged. A colon written on an existing `v` asks for nothing new — `vv:1` is `vv1`.

Unspaced runs are split at their tone digits here too, and keep their original spacing: a sentence
can mix Chinese with either spaced or unspaced pinyin, `toPinyinTonesInline('今天ni3hao3')` gives
`'今天nǐhǎo'`, while `'abcju1'` and `'ju1abc'` are still left alone because the run is glued to an
English word.

```javascript
import anotherPinyinTones from 'pinyin-tone';

console.log(anotherPinyinTones('qi3 lai2 bu2 yuan4 zuo4 nu2 li4 de ren2 men'));
// -> 'qǐ lái bú yuàn zuò nú lì de rén men'

console.log(anotherPinyinTones('huar1 wei4 shen2 me zhe4 yang4 hong2'));
// -> 'huār wèi shén me zhè yàng hóng'
```

## Unspaced input

`toPinyinTones` accepts unspaced input directly: a tone digit is enough to cut a syllable, so
`han4yu3pin1yin1` needs no preprocessing. What it does not do is decide your layout — spacing
is never added, removed, or collapsed:

```javascript
toPinyinTones('han4yu3pin1yin1');        // 'hànyǔpīnyīn'
toPinyinTones('han4 yu3pin1yin1');       // 'hàn yǔpīnyīn'
toPinyinTones('han4 yu3  pin1   yin1');  // 'hàn yǔ  pīn   yīn'  — spaces kept as written
```

Glue the output at the call site when that is what you want:

```javascript
toPinyinTones('han4 yu3pin1yin1').replace(/ /g, '');  // 'hànyǔpīnyīn'
```

The digit is not optional: a run with no tone number to cut at (`hanyu3pin1yin1`) is returned
as written rather than guessed at. Put a space or a `0` after the syllable that has no tone
number — `han yu3pin1yin1` or `han0yu3pin1yin1`, both `hanyǔpīnyīn`.

## Contributors

![Contributors](https://mrchenguozheng.github.io/pinyin-tone/CONTRIBUTORS.svg "Contributors")

## Contributing

If you find any bugs, glitches, or have feature requests, please [submit them here](https://github.com/mrchenguozheng/pinyin-tone/issues). Thank you!

## Changelog

For update history, see the [CHANGELOG here](https://github.com/mrchenguozheng/pinyin-tone/blob/master/CHANGELOG.md).
It is not shipped in the npm package — 22KB of prose that npm does not render — so read it in the
repository.

## Tests

see `test/*.js`.

Tests have been rewritten. — 2025-03-16

## License

MIT

## About 汉语拼音方案(hàn yǔ pīn yīn fāng àn)

You can find the official document [汉语拼音方案.pdf] at <http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html>

[汉语拼音方案.pdf]:http://www.moe.gov.cn/ewebeditor/uploadfile/2015/03/02/20150302165814246.pdf
