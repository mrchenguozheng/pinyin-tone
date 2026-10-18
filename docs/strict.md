# `strict` mode

The dictionary is deliberately permissive: 1952 keys, of which 876 pass `strict` — the 426
syllables of Standard Mandarin plus their erhua forms and the literal `jv` spellings,
resolved by projection. The other 1076 are initial × final cross products (`jui`, `juang`,
`biong`), real-world non-standard spellings (`duang`, `biu`), or `v` used as a consonant
(`vai`, `bvan`).

All of them convert by default. `strict: true` converts only the 876 and passes the rest
through.

中文: [strict.zh.md](strict.zh.md)

```javascript
markTones('jui1');                   // 'juī'
markTones('duang1');                 // 'duāng'
markTones('jui1', {strict: true});   // 'jui1'  — not a syllable, left alone
markTones('duang1', {strict: true}); // 'duang1'
markTones('huar1', {strict: true});  // 'huār'  — hua is a syllable, so huar is too
markTones('e^2', {strict: true});    // 'ế'     — ê is a rime of its own
```

## How the check works

Erhua is decided by its base: `huar` is valid exactly because `hua` is. Literal spellings are
projected onto the standard ones before the check, so they behave the same in both modes. A
rejected syllable makes the whole run pass through — same all-or-nothing rule as everywhere
else.

The option defaults to `false`, and a non-boolean value is ignored rather than coerced.

## When to reach for it

Turn it on when the input is machine-generated pinyin and you would rather see an unexpected
code pass through untouched than be converted into something that looks like a word. Leave it
off when the input is human-typed and may contain non-standard but intended spellings.
