# `strict` mode

The dictionary is deliberately permissive: 1952 keys, of which 876 pass `strict` — the 426
syllables of Standard Mandarin plus their erhua forms and the literal `jv` spellings,
resolved by projection. The other 1076 are initial × final cross products (`jui`, `juang`,
`biong`), real-world non-standard spellings (`duang`, `biu`), or `v` used as a consonant
(`vai`, `bvan`).

All of them convert by default. `strict: true` converts only the 876 and passes the rest
through.

中文：词表故意宽松——1952 个键里 876 个通过 `strict`（426 个普通话音节，加上由投影得到的儿化与字面 `jv` 写法），其余 1076 个是声母×韵母的笛卡尔积、现实中存在的非标准拼写、或把 `v` 当辅音的组合。默认全转，`{strict: true}` 只放行前者。

```javascript
markTones('jui1');                  // 'juī'
markTones('duang1');                // 'duāng'
markTones('jui1', {strict: true});  // 'jui1'  — not a syllable, left alone
markTones('duang1', {strict: true}); // 'duang1'
markTones('huar1', {strict: true}); // 'huār'  — hua is a syllable, so huar is too
markTones('e^2', {strict: true});   // 'ế'     — ê is a rime of its own
```

## How the check works

Erhua is decided by its base: `huar` is valid exactly because `hua` is. Literal spellings are
projected onto the standard ones before the check, so they behave the same in both modes. A
rejected syllable makes the whole run pass through — same all-or-nothing rule as everywhere
else.

The option defaults to `false`, and a non-boolean value is ignored rather than coerced.

中文：儿化由基底决定（`huar` 成立是因为 `hua` 成立），字面拼写先投影再判定，因此两种模式下表现一致。被挡掉的音节让整个片段原样返回——与全局规则一样是全或无。选项默认 `false`，传非布尔值会被忽略而不是强转。

## When to reach for it

Turn it on when the input is machine-generated pinyin and you would rather see an unexpected
code pass through untouched than be converted into something that looks like a word. Leave it
off when the input is human-typed and may contain non-standard but intended spellings.

中文：输入是程序生成的规范拼音、你希望可疑的东西原样留着而不是变成一个「看着像词」的输出时打开它；输入是人写的、可能故意用了非标准拼写时保持默认。
