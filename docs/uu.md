# `ü`, the colon, `ê`, and the vowel-less interjections

Two ASCII spellings of one letter, one caret for one rime, and the syllables that have no
vowel at all.

中文：本页讲 `ü` 的两种 ASCII 拼写、冒号的全部合法位置、`ê` 的 `e^` 写法，以及 `m`/`n`/`ng`/`hm`/`hng` 这几个没有元音的音节如何标调。

## Two spellings of `ü`

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

## The colon asks for the diaeresis

A colon is the two dots themselves. It has exactly two legal positions: right after the
`u`/`v` it sits on, or at the end of the syllable. Everything after it still belongs to the
same final, so `lu:e4` is `lüè`, not `lü` + `é`; `jv:an1` and `jvan:1` both give `jüān`.
Anywhere else (`j:van1`, `jva:n1`) is a misplaced marker, and the token comes back
unchanged.

The initial is not checked — `gu:1` is `gǖ` and `u:e1` is `üē`, neither a valid syllable,
both rendered on purpose:

```javascript
markTones('ju1 ju:1'); // 'jū jǖ'  — both spellings in one line
markTones('juan:1');   // 'jüān'
markTones('lu:e4');    // 'lüè'
markTones('gu:1');     // 'gǖ'
markTones('u:e1');     // 'üē'
```

There is no option that switches a whole string to the literal spelling, and no entry point
that returns both — ask per token, and call twice if you need the two forms side by side.

中文：冒号就是 `ü` 上面那两点，只有两个合法位置 —— 紧跟承载它的 `u`/`v`，或缀在整个音节末尾；其后的字母仍属同一韵母（`lu:e4` → `lüè`），两种位置结果相同（`jv:an1` = `jvan:1` = `jüān`）。写在别处（`j:van1`、`jva:n1`）当写错，整串原样。它不看声母：`gu:1` → `gǖ`、`u:e1` → `üē`，不合规范也照做。没有整串切换字面拼写的开关，也没有一次返回两种形式的入口——按 token 请求，需要并排就调两次。

### When the colon declines

It returns the token unchanged when there is no `u`/`v` to carry the dots, when the `u` it
lands on would be replaced by a consonant `v` that entry reads as a letter you never wrote,
or when the colon is in neither legal position.

```javascript
markTones('ma:1');    // 'ma:1'    — no u/v to put dots on
markTones('ji:1');    // 'ji:1'    — same
markTones('uang:1');  // 'uang:1'  — the u would become a consonant v
markTones('shui:3');  // 'shui:3'  — same
markTones('j:van1');  // 'j:van1'  — misplaced
markTones('jva:n1');  // 'jva:n1'  — misplaced
```

中文：三类落空原样返回：音节里没有 `u`/`v`（`ma:1`、`ji:1`）；落点是 `u` 但词表把换出的 `v` 当辅音，会冒出你没写过的字母（`uang:1`、`shui:3`）；冒号既不在承载位后、也不在音节末尾（`j:van1`、`jva:n1`）。

### A colon on a `v` is not a request

`v` already is the ASCII spelling of `ü`, so `jv:1` is exactly `ju:1`. When that leading `v`
is a consonant in the entry, the colon adds nothing and `vv:1` is `vv1` — both `vǖ`, since
the entry's value is `vü`.

```javascript
markTones('jv:1'); // 'jǖ'  — same as ju:1
markTones('vv:1'); // 'vǖ'  — same as vv1
```

中文：冒号落在 `v` 上则视为没写：`jv:1` 就是 `ju:1`，`vv:1` 就是 `vv1`（都是 `vǖ`，词表值是 `vü`）。

## `ê`

`ê` is a rime of its own, written `e^` — the caret is the circumflex, the same trick as the
colon. It belongs to `e` and nothing else, and is mutually exclusive with the colon, since
`ê` has no `u` to carry dots:

```javascript
markTones('e^');    // 'ê'
markTones('e^2');   // 'ế'
markTones('e^4');   // 'ề'
markTones('be^2');  // 'be^2'  — ê is not a final of b
markTones('e^r');   // 'e^r'   — and the caret is not a replacement for the r
```

中文：`ê` 是独立韵母，写作 `e^`（caret 就是那个扬抑符，与冒号同一套思路）；只对 `e` 有效，且与冒号互斥（`ê` 没有 `u` 可以承载两点）。

## Vowel-less syllables

`m`, `n`, `ng`, `hm` and `hng` are in the dictionary too. With no vowel, the mark goes on the
**last nasal**: `m2` is `ḿ`, `ng4` is `ǹg`, `hng1` is `hn̄g`.

```javascript
markTones('m2');    // 'ḿ'
markTones('ng4');   // 'ǹg'
markTones('hng1');  // 'hn̄g'
```

Nine of the twenty possible forms are dictionary entries and are spelled exactly as listed;
the rest (`m3`, `n1`, `ng1`, all four tones of `hm`/`hng`) come from the same rule and are
not distinguished in the output.

中文：`m`/`n`/`ng`/`hm`/`hng` 没有元音，调号标在**最后一个鼻音**上（`m2` → `ḿ`、`hng1` → `hn̄g`）。二十种形式里九个是词典收录、其余由同一规则外推，输出不区分。

## Precomposed and combining glyphs

Some of these glyphs have no precomposed character, so they are a letter plus a combining
mark; the rest are single code points. Both render the same, but if you compare strings by
bytes or by length, they differ.

| Glyph | Code points |
| --- | --- |
| `ê̄` (ê, tone 1) | `U+00EA U+0304` |
| `ê̌` (ê, tone 3) | `U+00EA U+030C` |
| `m̄` (m, tone 1) | `U+006D U+0304` |
| `m̌` (m, tone 3) | `U+006D U+030C` |
| `m̀` (m, tone 4) | `U+006D U+0300` |
| `n̄` (n, tone 1) | `U+006E U+0304` |

The other thirty tone-mark glyphs in the table are single code points.

中文：有六个字形没有预组合字符，由「字母 + 组合符」组成（`ê̄`、`ê̌`、`m̄`、`m̌`、`m̀`、`n̄`），其余三十个是单一码位。渲染看起来一样，但按字节或长度比较字符串时不同。
