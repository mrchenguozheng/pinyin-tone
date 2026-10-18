# pinyin-tone

Convert numeric tone notation (`hao3`) to Pinyin diacritics (`hǎo`). Two functions, no
dependencies, and unspaced or mixed text needs no preprocessing.

把 `hao3` 这类数字声调转成带调号的拼音 `hǎo`。两个函数，无依赖；连写与中英混排都能直接喂进去。

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

## Quick start

```bash
npm install pinyin-tone
```

Node.js 14 or later (`engines`). ESM only — `"type": "module"`, no CommonJS build.

```javascript
import toToneMarks, {toToneMarksInText} from 'pinyin-tone';

toToneMarks('chu1 yin1 wei4 lai2');  // 'chū yīn wèi lái'
toToneMarks('jv1 ju1 ju:1');         // 'jū jū jǖ'
toToneMarksInText('今天ni3hao3');    // '今天nǐhǎo'
```

中文：`toToneMarks` 按空格切 token，`toToneMarksInText` 扫整段、只替换能成词的拼音片段。Node.js 14+，只提供 ESM。

## API

| Export | Signature | Use |
| --- | --- | --- |
| `toToneMarks` (default) | `(text, {strict?}) => string` | space-separated pinyin |
| `toToneMarksInText` | `(text, {strict?}) => string` | pinyin mixed into Chinese text |

The names say what comes back, not what goes in: both put **tone marks** on pinyin you have
already written in ASCII (`hao3`, `jv`, `e^`). Neither turns Chinese characters into pinyin,
and neither guesses a tone that was not written — `ma` stays `ma`.

中文：名字说的是产出（调号），不是「汉字转拼音」：两个入口都不做汉字转拼音，也不猜没写出来的声调（`ma` 仍是 `ma`）。

Only these two are public. Everything else in the package — including `pinyin-tone/lib/*`,
which you can see in `node_modules` — is private: files may be renamed or deleted in any
release, and the dictionary's file layout, table shape and key order are not a contract.
Importing those paths gives you `ERR_PACKAGE_PATH_NOT_EXPORTED` or silently wrong results.

中文：公开接口只有这两个函数。包内其余路径（含 `node_modules` 里看得见的 `lib/` 文件）都是私有实现，随时可能改名或删除；词表的文件划分、表结构、键顺序都不构成契约。

## How a token is read

`toToneMarks` splits the string on spaces. Each token is cut into syllables at its tone
digits; each syllable is a base form, an optional marker (`^` for `ê`, `:` for a literal
`ü`), and an optional digit `0`–`5`. ASCII punctuation between syllables is kept. If any
piece does not resolve, the **whole token** is returned unchanged — never a half-converted
one.

中文：按空格切 token；每个 token 按声调数字切成音节，每个音节 = 基底 + 可选标记（`^` 表 `ê`、`:` 表字面 `ü`）+ 可选数字 `0`–`5`。音节间的 ASCII 标点原样保留。任一段认不出，**整个 token** 原样返回，绝不输出半截。

```javascript
toToneMarks('ni3hao3');        // 'nǐhǎo'   — one digit per syllable is enough to cut
toToneMarks('ni3 hao3');       // 'nǐ hǎo'  — a space in the input stays a space
toToneMarks('ni3,hao3');       // 'nǐ,hǎo'  — punctuation stays, both sides convert
toToneMarks('a1b2c3');         // 'a1b2c3'  — b and c are not syllables, nothing is touched
toToneMarks('hanyu3pin1yin1'); // unchanged — "hanyu" has no digit to cut at
```

Uppercase letters, a digit outside `0`–`5`, and CJK characters also make the whole token
pass through; use `toToneMarksInText` when Chinese is mixed in.

中文：大写字母、`0`–`5` 之外的数字、汉字，同样让整个 token 原样通过；中英混排用 `toToneMarksInText`。

### Spacing is yours

Spacing is never added, removed or collapsed — what you wrote is what you get, including
double spaces. Unspaced input works as-is because the digit is the cut point; gluing the
output is a call-site decision:

```javascript
toToneMarks('han4yu3pin1yin1');                     // 'hànyǔpīnyīn'
toToneMarks('han4 yu3  pin1   yin1');               // 'hàn yǔ  pīn   yīn'
toToneMarks('han4 yu3pin1yin1').replace(/ /g, '');  // 'hànyǔpīnyīn'
```

The digit is not optional. A run with nothing to cut at (`hanyu3pin1yin1`) comes back as
written rather than guessed. Put a `0` after a toneless syllable to separate without adding
a space — `han0yu3pin1yin1` gives `hanyǔpīnyīn`; a space separates too, but it stays in the
output, so `han yu3pin1yin1` gives `han yǔpīnyīn`.

中文：空格不增、不删、不合并，多打的也照样保留。连写输入直接可用（数字就是切点）；要粘连就在调用方 `.replace(/ /g, '')`。数字不能省——没有切点的 `hanyu3pin1yin1` 原样返回。没有声调的音节后面补 `0` 可以分隔而不产生空格（`han0yu3pin1yin1` → `hanyǔpīnyīn`）；用空格分隔则空格会留在输出里（`han yu3pin1yin1` → `han yǔpīnyīn`）。

### Two spellings of `ü`

After `j`/`q`/`x`/`y`, both the standard spelling (`ju`, `jue`, `juan`, `jun`) and the
literal one (`jv`, `jve`, `jvan`, `jvn`) are accepted as input. Output is always standard —
the *Scheme for the Chinese Phonetic Alphabet* requires dropping the diaeresis there:

```javascript
toToneMarks('jv1'); // 'jū'  — literal input, standard output
toToneMarks('ju1'); // 'jū'  — standard input, standard output
```

`n` and `l` are not part of this projection: there `u` and `ü` are distinct sounds, so `nv3`
is `nǚ` and `nu3` is `nǔ`. `nu:3` also gives `nǚ`, but that is an explicit request for the
diaeresis, not a projection.

中文：`j`/`q`/`x`/`y` 之后的 `ü` 有规范（`ju`）与字面（`jv`）两种输入，输出一律规范形式。`n`/`l` 不参与投影：`nv3` 是 `nǚ`、`nu3` 是 `nǔ`，两者是对立音位。

### The colon asks for the diaeresis

A colon is the two dots themselves, written after the `u` they sit on. Everything after it
still belongs to the same final, so `lu:e4` is `lüè`, not `lü` + `é`. It does not check the
initial — `gu:1` is `gǖ` and `u:e1` is `üē`, neither a valid syllable, both rendered on
purpose:

```javascript
toToneMarks('ju1 ju:1'); // 'jū jǖ'  — both spellings in one line
toToneMarks('juan:1');   // 'jüān'
toToneMarks('lu:e4');    // 'lüè'
toToneMarks('gu:1');     // 'gǖ'
```

There is no option that switches a whole string to the literal spelling, and no entry point
that returns both — ask per token, and call twice if you need the two forms side by side.

It declines in two cases, returning the token unchanged: no `u`/`v` to carry the dots
(`ma:1`, `ji:1`), or a `u` whose replacement is read as a consonant `v` by that entry, which
would put a letter you never wrote into the output (`uang:1`, `shui:3`).

A colon on a `v` is not a request at all: `v` already is the ASCII spelling of `ü`, so
`jv:1` is exactly `ju:1`. When that leading `v` is a consonant in the entry, the colon adds
nothing and `vv:1` is `vv1` — both `vǖ`, since the entry's value is `vü`.

中文：冒号就是 `ü` 上面那两点，写在承载它的 `u` 后；其后的字母仍属同一韵母（`lu:e4` → `lüè`）。它不看声母：`gu:1` → `gǖ`、`u:e1` → `üē`，不合规范也照做。没有整串切换字面拼写的开关，也没有一次返回两种形式的入口——按 token 请求，需要并排就调两次。

两类落空原样返回：音节里没有 `u`/`v`（`ma:1`、`ji:1`）；落点是 `u` 但词表把换出的 `v` 当辅音，会冒出你没写过的字母（`uang:1`、`shui:3`）。冒号落在 `v` 上则视为没写：`jv:1` 就是 `ju:1`，`vv:1` 就是 `vv1`（都是 `vǖ`，词表值是 `vü`）。

### `ê` and the vowel-less interjections

`ê` is a rime of its own, written `e^` — the caret is the circumflex, the same trick as the
colon. It belongs to `e` and nothing else (`be^2`, `e^r` stay as written) and is mutually
exclusive with the colon, since `ê` has no `u` to carry dots:

```javascript
toToneMarks('e^');   // 'ê'
toToneMarks('e^2');  // 'ế'
toToneMarks('e^4');  // 'ề'
```

`m`, `n`, `ng`, `hm` and `hng` are in the dictionary too. With no vowel, the mark goes on
the **last nasal**: `m2` is `ḿ`, `ng4` is `ǹg`, `hng1` is `hn̄g`. Nine of the twenty possible
forms are dictionary entries and are spelled exactly as listed; the rest (`m3`, `n1`, `ng1`,
all four tones of `hm`/`hng`) come from the same rule and are not distinguished in the
output.

Some of these glyphs have no precomposed character: `ê̄`, `ê̌`, `m̄`, `m̀`, `m̌`, `n̄` are a
letter plus U+0304 / U+0300 / U+030C, while `ế`, `ề`, `ḿ`, `ń`, `ň`, `ǹ` are single code
points.

中文：`ê` 是独立韵母，写作 `e^`（caret 就是那个扬抑符，与冒号同一套思路）；只对 `e` 有效，且与冒号互斥。`m`/`n`/`ng`/`hm`/`hng` 没有元音，调号标在**最后一个鼻音**上（`m2` → `ḿ`、`hng1` → `hn̄g`）。二十种形式里九个是词典收录、其余由同一规则外推，输出不区分。没有预组合字符的字形由「字母 + 组合符」组成。

## Strict mode

The dictionary is deliberately permissive: 1952 keys, of which 876 pass `strict` — the 426
syllables of Standard Mandarin plus their erhua forms and the literal `jv` spellings,
resolved by projection. The other 1076 are initial × final cross products (`jui`, `juang`,
`biong`), real-world non-standard spellings (`duang`, `biu`), or `v` used as a consonant
(`vai`, `bvan`). All of them convert by default:

```javascript
toToneMarks('jui1');                  // 'juī'
toToneMarks('duang1');                // 'duāng'
toToneMarks('jui1', {strict: true});  // 'jui1'  — not a syllable, left alone
toToneMarks('huar1', {strict: true}); // 'huār'  — hua is a syllable, so huar is too
toToneMarks('e^2', {strict: true});   // 'ế'     — ê is a rime of its own
```

Erhua is decided by its base: `huar` is valid exactly because `hua` is. Literal spellings
are projected onto the standard ones before the check, so they behave the same in both
modes. A rejected syllable makes the whole token pass through. Both entry points accept the
option; it defaults to `false`.

中文：词表故意宽松——1952 个键里 876 个通过 `strict`（426 个普通话音节，加上由投影得到的儿化与字面 `jv` 写法），其余 1076 个是声母×韵母的笛卡尔积、现实中存在的非标准拼写、或把 `v` 当辅音的组合。默认全转，`{strict: true}` 只放行前者。儿化由基底决定（`huar` 成立是因为 `hua` 成立），字面拼写先投影再判定；两个入口都接受该选项，默认 `false`。

## Mixed text

`toToneMarks` splits on spaces, so pinyin glued to Chinese (`ju是规范写法`) is returned
untouched. `toToneMarksInText` scans the whole string and replaces only the runs it can
resolve:

```javascript
toToneMarksInText('ju是规范写法，而ju:1是不规范写法');
// -> 'ju是规范写法，而jǖ是不规范写法'
```

Same rules as above: bare tokens give the standard spelling, a colon asks for the literal
one, unspaced runs are cut at their digits. A run glued to an English word (`abcju1`,
`ju1abc`) is left alone, and so is a bare `ju` with no tone digit.

中文：`toToneMarks` 按空格切，所以 `ju是规范写法` 这类粘连会整串原样返回；`toToneMarksInText` 扫全文，只替换能成词的片段。规则与前面相同（裸写给规范形式、冒号要字面形式、连写按数字切）；粘在英文单词上的 `abcju1`/`ju1abc`，以及没有声调数字的 `ju`，都不动。

## Migrating from 2.x

3.0 is the dictionary-based implementation that 2.x reached only through `pinyin-tone/v2`.
On the 13,664 inputs formed by every dictionary key × its seven tone spellings, the two
disagree on 11.3% — 3.0 fixes cases where the old one dropped letters (`biou1`: 2.x gives
`biū`, 3.0 gives `biōu`). Pin `pinyin-tone@2.4.1` if you need the old output.

| 2.x | 3.0 |
| --- | --- |
| `pinyin-tone/v2` (alias) | the root entry |
| `pinyin-tone/v1` | removed |
| `toPinyinTones(x)` | `toToneMarks(x)` — renamed |
| `toPinyinTonesInline(x)` | `toToneMarksInText(x)` — renamed |
| `pinyin-tone/workaround` | `toToneMarks` (superset of its 36 inputs) |
| `convertUnspacedPinyin(x)` | `toToneMarks(x).replace(/ /g, '')` |
| `toPinyinTonesVariants(x)` | one colon per token that needs it |
| `splitUnspacedSyllables(x)` | internal step, no replacement needed |

中文：3.0 的根入口就是 2.x 里 `pinyin-tone/v2` 那份实现。把每个词表键 × 七种声调写法拼成的 13664 个输入逐条对比，两者有 11.3% 不同——3.0 修的是旧实现丢字母的情况（`biou1`：2.x 给 `biū`，3.0 给 `biōu`）。需要旧输出请锁 `pinyin-tone@2.4.1`。

## Contributors

![Contributors](https://mrchenguozheng.github.io/pinyin-tone/CONTRIBUTORS.svg "Contributors")

## Contributing

Bugs and feature requests: [open an issue](https://github.com/mrchenguozheng/pinyin-tone/issues).
Tests run with `npm test` (mocha + `tsc --noEmit`).

中文：问题与建议请提 issue；测试用 `npm test`。

## Changelog

[CHANGELOG.md](https://github.com/mrchenguozheng/pinyin-tone/blob/master/CHANGELOG.md) lives
in the repository. It is not shipped in the npm package.

中文：更新日志在仓库里，不随 npm 包发布。

## License

MIT

## About 汉语拼音方案(hàn yǔ pīn yīn fāng àn)

You can find the official document [汉语拼音方案.pdf] at
<http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html>

[汉语拼音方案.pdf]: http://www.moe.gov.cn/ewebeditor/uploadfile/2015/03/02/20150302165814246.pdf
