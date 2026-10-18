# Capitalisation

Case is part of the spelling, not decoration. The *Basic Rules of Pinyin Orthography*
(GB/T 16159) puts a capital at the start of a sentence, on the first letter of a proper noun,
and allows a proper noun in all caps — and its own all-caps examples keep the tone marks
(`BĚIJĪNG`, `LǏ HUÁ`). All three forms convert, and the form comes back on the output.

中文: [case.zh.md](case.zh.md)

```javascript
markTones('Zhong1guo2'); // 'Zhōngguó'
markTones('BEI3JING1');  // 'BĚIJĪNG'
markTones('ni3Hao3');    // 'nǐHǎo'   — read per syllable, so syllables may differ
markTones('hAo3');       // 'hAo3'    — no such spelling in the standard
```

The form is read per syllable, so `ZHONG1guo2` gives `ZHŌNGguó`. Mixed case inside one
syllable (`hAo3`, `HaO3`) is not a spelling the standard defines and is returned as written.

## The consequence for all-caps codes

An all-caps Latin token carrying a digit cannot be told apart from pinyin, so `A4` becomes
`À`, `O2` becomes `Ó` and `CO2` becomes `CÓ`. Lowercasing the input is one way out, but it
also flattens the case of names you meant to keep; list the codes in `skip` instead, and
everything else keeps its case.

```javascript
markTones('A4');                            // 'À'
markTones('CO2');                           // 'CÓ'
markTones('M2 货币供应量 hao3', {skip: 'M2'});  // 'M2 货币供应量 hǎo'
markTones('M2 A4 N3', {skip: ['M2', 'A4']});    // 'M2 A4 Ň'
```

`skip` compares the whole run, case-sensitively: `'M2'` cannot touch `M20` (a different
run) or `m2` (a different string). See [`skip.md`](skip.md).
