# pinyin-tone

Convert numeric tone notation (`hao3`) to Pinyin diacritics (`hǎo`). One function, no
dependencies; unspaced or mixed text needs no preprocessing.

把 `hao3` 这类数字声调转成带调号的拼音 `hǎo`。一个函数，无依赖；连写与中英混排都能直接喂进去。

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

## Quick start

```bash
npm install pinyin-tone
```

Node.js 14 or later (`engines`). ESM only — `"type": "module"`, no CommonJS build. Where a
newer Node lets `require()` load ESM, destructure it: `const {markTones} = require('pinyin-tone')`.

```javascript
import {markTones} from 'pinyin-tone';

markTones('chu1 yin1 wei4 lai2');  // 'chū yīn wèi lái'
markTones('jv1 ju1 ju:1');         // 'jū jū jǖ'
markTones('今天ni3hao3');          // '今天nǐhǎo'
```

中文：只有一个具名导出 `markTones`，拼音串与中英混排都走它。Node.js 14+，只提供 ESM；新版 Node 能用 `require()` 读 ESM 时写成 `const {markTones} = require('pinyin-tone')`。

## API

| Export | Signature |
| --- | --- |
| `markTones` | `(text, {strict?, skip?}) => string` |

The name says what the call does, not what the package is: it **marks** pinyin you have
already written in ASCII (`hao3`, `jv`, `e^`) with tone marks. It does not turn Chinese
characters into pinyin, and does not guess a tone that was not written — `ma` stays `ma`.

中文：名字说的是这个调用做了什么 —— 给你已经用 ASCII 写好的拼音**标上**调号，不是「汉字转拼音」。它不做汉字转拼音，也不猜没写出来的声调（`ma` 仍是 `ma`）。

Only this function is public. Everything else in the package — including `pinyin-tone/lib/*`,
which you can see in `node_modules` — is private: files may be renamed or deleted in any
release, and the dictionary's file layout, table shape and key order are not a contract.
Importing those paths gives you `ERR_PACKAGE_PATH_NOT_EXPORTED` or silently wrong results.

中文：公开接口只有这一个函数。包内其余路径（含 `node_modules` 里看得见的 `lib/` 文件）都是私有实现，随时可能改名或删除；词表的文件划分、表结构、键顺序都不构成契约。

## How a run is read

The input is scanned for runs of letters, `:` `^` and digits `0`–`5`. Everything
outside a run — Chinese characters, punctuation, whitespace — is copied through untouched.
Each run is cut into syllables at its tone digits; each syllable is a base form, an optional
marker (`^` for `ê`, `:` for a literal `ü`), and an optional digit `0`–`5`. A run that does
not resolve as a whole is returned as written — never half-converted.

中文：整段扫描「字母 / `:` / `^` / `0`–`5`」组成的片段，片段之外的字符（汉字、标点、空白）逐字照抄。片段内部按声调数字切成音节，每个音节 = 基底 + 可选标记（`^` 表 `ê`、`:` 表字面 `ü`）+ 可选数字 `0`–`5`。整个片段认不全就原样返回，绝不输出半截。

```javascript
markTones('ni3hao3');        // 'nǐhǎo'   — one digit per syllable is enough to cut
markTones('ni3 hao3');       // 'nǐ hǎo'  — a space is just text between runs
markTones('ni3,hao3');       // 'nǐ,hǎo'  — punctuation stays, both sides convert
markTones('a1b2c3');         // 'a1b2c3'  — b and c are not syllables, run untouched
markTones('hanyu3pin1yin1'); // unchanged — "hanyu" has no digit to cut at
markTones('今天ni3hao3');     // '今天nǐhǎo' — Chinese is not part of any run
```

A digit outside `0`–`5` leaves the run untouched — `ma6` comes back as written because the
`6` would otherwise be dropped. A run touching an ASCII word character is left alone as
well, which includes `_`: `ni3_hao3` reads as an identifier, not two syllables.

中文：`0`–`5` 之外的数字让整个片段不动（`ma6` 原样，否则那个 `6` 会被吞掉）；紧邻 ASCII 词字符的片段也不动，其中包含下划线：`ni3_hao3` 视作标识符，不是两个音节。

### Case

Case is part of the spelling, not decoration. The *Basic Rules of Pinyin Orthography*
(GB/T 16159) puts a capital at the start of a sentence, on the first letter of a proper
noun, and allows a proper noun in all caps — and its own all-caps examples keep the tone
marks (`BĚIJĪNG`, `LǏ HUÁ`). All three forms convert, and the form comes back on the output:

```javascript
markTones('Zhong1guo2'); // 'Zhōngguó'
markTones('BEI3JING1');  // 'BĚIJĪNG'
markTones('hAo3');       // 'hAo3'   — no such spelling in the standard
```

The form is read per syllable, so `ZHONG1guo2` gives `ZHŌNGguó`. Mixed case inside one
syllable (`hAo3`, `HaO3`) is not a spelling the standard defines and is returned as written.

中文：大小写是拼写的一部分，不是装饰。正词法把大写放在句首、专名首字母，并允许专名全部大写；它自己的全大写例子仍带调号（`BĚIJĪNG`、`LǏ HUÁ`）。三种形态都转换并原样带回：`Zhong1guo2` → `Zhōngguó`、`BEI3JING1` → `BĚIJĪNG`。形态按音节判定，所以 `ZHONG1guo2` → `ZHŌNGguó`；音节内混用（`hAo3`）不是标准里的写法，原样返回。

One consequence: an all-caps Latin token carrying a digit cannot be told apart from pinyin,
so `A4` becomes `À` and `O2` becomes `Ó`. Lowercase the input first if it is mostly English.

中文：代价是「全大写拉丁串 + 数字」与拼音无法区分，`A4` 会变成 `À`、`O2` 会变成 `Ó`；输入以英文为主时先转小写。

### Skipping a class of tokens

`M2`, `A4`, `O2` collide with pinyin — `m`, `a` and `o` are syllables on their own, so `M2`
would come out as `Ḿ`. Say which runs to keep as written, once, in the options:

```javascript
markTones('M2 货币供应量 hao3', {skip: 'M2'});   // 'M2 货币供应量 hǎo'
markTones('M2 A4 N3', {skip: ['M2', 'A4']});     // 'M2 A4 Ň'
```

A string or an array compares the whole run, case-sensitively: `'M2'` cannot touch `M20`
(a different run) or `m2` (a different string). That is the entire rule — no patterns, no
predicates, and no marker characters inside the text, so a path like `C:\Users` or a LaTeX
command like `\texttt` passes through exactly as written (`\ni3` still gets its tone,
though: the backslash is an ordinary character to this library).

A `RegExp` is deliberately not accepted: a regex reads as "search the text", while a rule
here only ever sees one run, so a lookbehind such as `(?<=今天 )` could never match and
`^`/`$` would anchor at the run's ends rather than the text's. Both fail silently, which is
worse than not being supported at all.

A rule is per run, so it covers every occurrence of that run: one run cannot mean two things
in the same call. If it does, cut the text and call once per part.

中文：`M2`、`A4`、`O2` 这类「全大写拉丁串 + 数字」与拼音撞车（`m`、`a`、`o` 本身就是音节，`M2` 会变成 `Ḿ`），用 `skip` 在选项里说一次要保留哪些片段。`skip` 只收字符串与字符串数组，比的是**整个片段**、区分大小写 —— `'M2'` 碰不到 `M20`（那是另一个片段），也碰不到 `m2`。输入里不写任何标记字符，所以 `C:\Users` 这样的路径、`\texttt` 这样的 LaTeX 命令一字不改（不过 `\ni3` 仍会被标调：对这里来说反斜杠只是普通字符）。**不收正则**：正则读起来是「在整段文本里找」，而这里只看得到单个片段 —— `(?<=今天 )` 这种环视永远匹配不上，`^`/`$` 锚在片段两端而不是文本两端，两者都是「写得像对的、其实不生效」。规则以片段为单位，覆盖该片段的每一次出现：同一个片段在一次调用里只能有一种处置，要区别对待就把文本切开分别调用。

### Spacing is yours

Spacing is never added, removed or collapsed — what you wrote is what you get, including
double spaces and leading or trailing whitespace. Unspaced input works as-is because the
digit is the cut point; gluing the output is a call-site decision:

```javascript
markTones('han4yu3pin1yin1');                     // 'hànyǔpīnyīn'
markTones('han4 yu3  pin1   yin1');               // 'hàn yǔ  pīn   yīn'
markTones('han4 yu3pin1yin1').replace(/ /g, '');  // 'hànyǔpīnyīn'
```

The digit is not optional, and can only be dropped for the last syllable of a run: `ni3hao3ma`
gives `nǐhǎoma`, while `ni3haoma5` comes back as written because `haoma` is not a syllable.
A run with nothing to cut at (`hanyu3pin1yin1`) is returned as written rather than guessed.
Put a `0` after a toneless syllable to separate without adding a space —
`han0yu3pin1yin1` gives `hanyǔpīnyīn`; a space separates too, but it stays in the output, so
`han yu3pin1yin1` gives `han yǔpīnyīn`.

中文：空格不增、不删、不合并，多打的、首尾的也照样保留。连写输入直接可用（数字就是切点）；要粘连就在调用方 `.replace(/ /g, '')`。数字不能省，且只有片段最后一段可以省：`ni3hao3ma` → `nǐhǎoma`，而 `ni3haoma5` 因为 `haoma` 不成音节原样返回。没有切点的 `hanyu3pin1yin1` 也不猜。没有声调的音节后面补 `0` 可以分隔而不产生空格（`han0yu3pin1yin1` → `hanyǔpīnyīn`）；用空格分隔则空格会留在输出里（`han yu3pin1yin1` → `han yǔpīnyīn`）。

### Two spellings of `ü`

After `j`/`q`/`x`/`y`, both the standard spelling (`ju`, `jue`, `juan`, `jun`) and the
literal one (`jv`, `jve`, `jvan`, `jvn`) are accepted as input. Output is always standard —
the *Scheme for the Chinese Phonetic Alphabet* requires dropping the diaeresis there:

```javascript
markTones('jv1'); // 'jū'  — literal input, standard output
markTones('ju1'); // 'jū'  — standard input, standard output
```

`n` and `l` are not part of this projection: there `u` and `ü` are distinct sounds, so `nv3`
is `nǚ` and `nu3` is `nǔ`. `nu:3` also gives `nǚ`, but that is an explicit request for the
diaeresis, not a projection.

中文：`j`/`q`/`x`/`y` 之后的 `ü` 有规范（`ju`）与字面（`jv`）两种输入，输出一律规范形式。`n`/`l` 不参与投影：`nv3` 是 `nǚ`、`nu3` 是 `nǔ`，两者是对立音位。

### The colon asks for the diaeresis

A colon is the two dots themselves. It has exactly two legal positions: right after the
`u`/`v` it sits on, or at the end of the syllable. Everything after it still belongs to the
same final, so `lu:e4` is `lüè`, not `lü` + `é`; `jv:an1` and `jvan:1` both give `jüān`.
Anywhere else (`j:van1`, `jva:n1`) is a misplaced marker, and the token comes back
unchanged. The initial is not checked — `gu:1` is `gǖ` and `u:e1` is `üē`, neither a valid
syllable, both rendered on purpose:

```javascript
markTones('ju1 ju:1'); // 'jū jǖ'  — both spellings in one line
markTones('juan:1');   // 'jüān'
markTones('lu:e4');    // 'lüè'
markTones('gu:1');     // 'gǖ'
```

There is no option that switches a whole string to the literal spelling, and no entry point
that returns both — ask per token, and call twice if you need the two forms side by side.

It declines in three cases, returning the token unchanged: no `u`/`v` to carry the dots
(`ma:1`, `ji:1`); a `u` whose replacement is read as a consonant `v` by that entry, which
would put a letter you never wrote into the output (`uang:1`, `shui:3`); or a colon that sits
neither right after its carrier nor at the end of the syllable (`j:van1`, `jva:n1`).

A colon on a `v` is not a request at all: `v` already is the ASCII spelling of `ü`, so
`jv:1` is exactly `ju:1`. When that leading `v` is a consonant in the entry, the colon adds
nothing and `vv:1` is `vv1` — both `vǖ`, since the entry's value is `vü`.

中文：冒号就是 `ü` 上面那两点，只有两个合法位置 —— 紧跟承载它的 `u`/`v`，或缀在整个音节末尾；其后的字母仍属同一韵母（`lu:e4` → `lüè`），两种位置结果相同（`jv:an1` = `jvan:1` = `jüān`）。写在别处（`j:van1`、`jva:n1`）当写错，整串原样。它不看声母：`gu:1` → `gǖ`、`u:e1` → `üē`，不合规范也照做。没有整串切换字面拼写的开关，也没有一次返回两种形式的入口——按 token 请求，需要并排就调两次。

三类落空原样返回：音节里没有 `u`/`v`（`ma:1`、`ji:1`）；落点是 `u` 但词表把换出的 `v` 当辅音，会冒出你没写过的字母（`uang:1`、`shui:3`）；冒号既不在承载位后、也不在音节末尾（`j:van1`、`jva:n1`）。冒号落在 `v` 上则视为没写：`jv:1` 就是 `ju:1`，`vv:1` 就是 `vv1`（都是 `vǖ`，词表值是 `vü`）。

### `ê` and the vowel-less interjections

`ê` is a rime of its own, written `e^` — the caret is the circumflex, the same trick as the
colon. It belongs to `e` and nothing else (`be^2`, `e^r` stay as written) and is mutually
exclusive with the colon, since `ê` has no `u` to carry dots:

```javascript
markTones('e^');   // 'ê'
markTones('e^2');  // 'ế'
markTones('e^4');  // 'ề'
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
markTones('jui1');                  // 'juī'
markTones('duang1');                // 'duāng'
markTones('jui1', {strict: true});  // 'jui1'  — not a syllable, left alone
markTones('huar1', {strict: true}); // 'huār'  — hua is a syllable, so huar is too
markTones('e^2', {strict: true});   // 'ế'     — ê is a rime of its own
```

Erhua is decided by its base: `huar` is valid exactly because `hua` is. Literal spellings
are projected onto the standard ones before the check, so they behave the same in both
modes. A rejected syllable makes the whole run pass through. The option defaults to `false`.

中文：词表故意宽松——1952 个键里 876 个通过 `strict`（426 个普通话音节，加上由投影得到的儿化与字面 `jv` 写法），其余 1076 个是声母×韵母的笛卡尔积、现实中存在的非标准拼写、或把 `v` 当辅音的组合。默认全转，`{strict: true}` 只放行前者。儿化由基底决定（`huar` 成立是因为 `hua` 成立），字面拼写先投影再判定；被挡掉的音节让整个片段原样返回，选项默认 `false`。

## Mixed text

Nothing special is needed: Chinese characters are not part of any run, so pinyin glued to
them is converted in place.

```javascript
markTones('ju是规范写法，而ju:1是不规范写法');
// -> 'ju是规范写法，而jǖ是不规范写法'
```

Same rules as above: bare syllables give the standard spelling, a colon asks for the literal
one, unspaced runs are cut at their digits. A run glued to an ASCII word (`abcju1`, `ju1abc`)
is left alone, and so is a bare `ju` with no tone digit.

中文：不需要特殊处理——汉字不属于任何片段，紧贴着的拼音就地转换。规则与前面相同（裸写给规范形式、冒号要字面形式、连写按数字切）；粘在英文单词上的 `abcju1`/`ju1abc`，以及没有声调数字的 `ju`，都不动。

## Migrating from 2.x

3.0 is the dictionary-based implementation that 2.x reached only through `pinyin-tone/v2`.
On the 13,664 inputs formed by every dictionary key × its seven tone spellings, the two
disagree on 11.3% — 3.0 fixes cases where the old one dropped letters (`biou1`: 2.x gives
`biū`, 3.0 gives `biōu`). Pin `pinyin-tone@2.4.1` if you need the old output.

3.0 also collapses the two 2.x entries into one: pinyin glued to Chinese used to need the
`Inline` variant, and is now handled by the same function. Nothing is lost on plain pinyin —
the merged entry returns the same string as the old space-splitting one, except that it no
longer trims leading/trailing whitespace and no longer converts `ni3_hao3` (an identifier,
not two syllables).

| 2.x | 3.0 |
| --- | --- |
| `pinyin-tone/v2` (alias) | the root entry |
| `pinyin-tone/v1` | removed |
| `toPinyinTones(x)` | `markTones(x)` — renamed |
| `toPinyinTonesInline(x)` | `markTones(x)` — merged into the single entry |
| `pinyin-tone/workaround` | `markTones` (superset of its 36 inputs) |
| `convertUnspacedPinyin(x)` | `markTones(x).replace(/ /g, '')` |
| `toPinyinTonesVariants(x)` | one colon per token that needs it |
| `splitUnspacedSyllables(x)` | internal step, no replacement needed |

中文：3.0 的根入口就是 2.x 里 `pinyin-tone/v2` 那份实现。把每个词表键 × 七种声调写法拼成的 13664 个输入逐条对比，两者有 11.3% 不同——3.0 修的是旧实现丢字母的情况（`biou1`：2.x 给 `biū`，3.0 给 `biōu`）。需要旧输出请锁 `pinyin-tone@2.4.1`。

3.0 还把 2.x 的两个入口并成一个：紧贴汉字的拼音以前要换 `Inline` 版本，现在同一个函数就认。纯拼音场景没有损失——结果与旧的按空格切版本逐条相同，只有两处不同：不再裁掉首尾空白，`ni3_hao3` 也不再转（那是标识符，不是两个音节）。

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
