# `ü`, the colon, `ê`, and the vowel-less interjections

Three things: two ASCII spellings of one letter, a caret for one rime, and the syllables that
have no vowel at all.

中文: [uu.zh.md](uu.zh.md)

## Two spellings of `ü`

After `j`/`q`/`x`/`y`, both the standard spelling (`ju`, `jue`, `juan`, `jun`) and the
literal one (`jv`, `jve`, `jvan`, `jvn`) are accepted as input. Output is always standard —
the *Scheme for the Chinese Phonetic Alphabet* requires dropping the diaeresis there:

```javascript
markTones('jv1'); // 'jū'  — literal input, standard output
markTones('ju1'); // 'jū'  — standard input, standard output
```

`n` and `l` are not part of this conversion: there `u` and `ü` are distinct sounds, so `nv3`
is `nǚ` and `nu3` is `nǔ`. `nu:3` also gives `nǚ`, but that is an explicit request for the
diaeresis, not a conversion.

## The colon asks for the diaeresis

A colon is the two dots themselves. It has exactly two legal positions: right after the
`u`/`v` it sits on, or at the end of the syllable. The colon joins the final it sits on rather
than closing it, so `lu:e4` is `lüè`, not `lü` + `é`; `jv:an1` and `jvan:1` both give `jüān`.
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

### A colon on a `v` is not a request

`v` already is the ASCII spelling of `ü`, so `jv:1` is exactly `ju:1`. When that leading `v`
is a consonant in the entry, the colon adds nothing and `vv:1` is `vv1` — both `vǖ`, since
the entry's value is `vü`.

```javascript
markTones('jv:1'); // 'jǖ'  — same as ju:1
markTones('vv:1'); // 'vǖ'  — same as vv1
```

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

## Precomposed and combining glyphs

Some of these glyphs have no precomposed character, so they are a letter plus a combining mark;
the rest are single code points. Both kinds render the same, but a byte or length comparison
tells them apart.

| Glyph | Code points |
| --- | --- |
| `ê̄` (ê, tone 1) | `U+00EA U+0304` |
| `ê̌` (ê, tone 3) | `U+00EA U+030C` |
| `m̄` (m, tone 1) | `U+006D U+0304` |
| `m̌` (m, tone 3) | `U+006D U+030C` |
| `m̀` (m, tone 4) | `U+006D U+0300` |
| `n̄` (n, tone 1) | `U+006E U+0304` |

The other thirty tone-mark glyphs in the table are single code points.
