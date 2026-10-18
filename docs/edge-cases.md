# Edge cases: digits, `_`, spacing

The main page keeps to the common path. This page is the full rule set for how a string is
scanned, where a run ends, and what happens at the boundaries.

中文: [edge-cases.zh.md](edge-cases.zh.md)

## The scan

The input is scanned for runs of letters (`A`–`Z`, `a`–`z`), `:`, `^` and the digits `0`–`5`.
Everything outside a run — Chinese characters, punctuation, whitespace — is copied through
untouched. Each run is then cut into syllables at its tone digits.

A syllable is a base form, an optional marker (`^` for `ê`, `:` for a literal `ü`), and an
optional digit `0`–`5`. A run that does not resolve as a whole is returned as written —
never half-converted.

```javascript
markTones('ni3hao3');        // 'nǐhǎo'   — one digit per syllable is enough to cut
markTones('ni3 hao3');       // 'nǐ hǎo'  — a space is just text between runs
markTones('ni3,hao3');       // 'nǐ,hǎo'  — punctuation stays, both sides convert
markTones('a1b2c3');         // 'a1b2c3'  — b and c are not syllables, run untouched
markTones('hanyu3pin1yin1'); // unchanged — "hanyu" has no digit to cut at
markTones('今天ni3hao3');     // '今天nǐhǎo' — Chinese is not part of any run
```

## Digits outside `0`–`5`

A digit outside `0`–`5` is not part of any run, so it sits at a boundary and is never
dropped (`ma6` comes back as written). Digits count as ASCII word characters, so a run
butting against one is left alone too:

```javascript
markTones('ma6');      // 'ma6'     — 6 is not a tone, and not swallowed
markTones('ni3ma6');   // 'ni3ma6'  — the run touches a digit, so it is not a run
markTones('ni3 ma6');  // 'nǐ ma6'  — a space separates them; ni3 converts alone
```

## `_` makes it an identifier

The same word-character rule applies to `_`: `ni3_hao3` reads as an identifier, not two
syllables, and is returned as written.

```javascript
markTones('ni3_hao3');  // 'ni3_hao3'
```

## Spacing

Spacing is never added, removed or collapsed — what you wrote is what you get, including
double spaces and leading or trailing whitespace.

```javascript
markTones('han4yu3pin1yin1');        // 'hànyǔpīnyīn'
markTones('han4 yu3  pin1   yin1');  // 'hàn yǔ  pīn   yīn'
```

Unspaced input works as-is because the digit is the cut point; gluing the output is a
call-site decision:

```javascript
markTones('han4 yu3pin1yin1').replace(/ /g, '');  // 'hànyǔpīnyīn'
```

## Where you may drop a digit

The digit is not optional, and can only be dropped for the last syllable of a run:

```javascript
markTones('ni3hao3ma');   // 'nǐhǎoma'   — last syllable may be toneless
markTones('ni3haoma5');   // 'ni3haoma5' — haoma is not a syllable, so nothing resolves
```

A run with nothing to cut at (`hanyu3pin1yin1`) is returned as written rather than guessed.

## Separating without a space

Put a `0` after a toneless syllable to separate without adding a space. A space separates
too, but it stays in the output.

```javascript
markTones('han0yu3pin1yin1');  // 'hanyǔpīnyīn'  — 0 separates, nothing appears
markTones('han yu3pin1yin1');  // 'han yǔpīnyīn' — the space stays
```
