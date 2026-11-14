# Migrating from 2.x to 3.0

`npm install pinyin-tone` installs 3.0 now. A project that says `^2` stays where it is —
`^2` cannot match `3.x` — so the upgrade happens when you edit `package.json`, not when you
run `npm install`.

This page holds what the README does not: the errors each removed name raises, the output
that changed, and a way to check your own input before you commit to the upgrade.

中文: [migrating.zh.md](migrating.zh.md)

## Renaming, entry by entry

| 2.x | 3.0 |
| --- | --- |
| `import toPinyinTones from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import {v2} from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import {markSinglePinyinVowel} from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import x from 'pinyin-tone/v2'` | `import {markTones} from 'pinyin-tone'` |
| `import {markSinglePinyinVowel} from 'pinyin-tone/workaround'` | `import {markTones} from 'pinyin-tone'` |
| `toPinyinTonesInline(text)` | `markTones(text)` |
| `convertUnspacedPinyin(text)` | `markTones(text).replace(/ /g, '')` |
| `splitUnspacedSyllables(text)` | nothing — glued input is accepted as written |
| `toPinyinTonesVariants(text)` | one spelling per call: `markTones('ju1 ju:1')` gives `'jū jǖ'` |
| `pinyin-tone/v1` | nothing — pin `pinyin-tone@2.5.2` |

CommonJS needs the same rename and one extra step: `require('pinyin-tone')` returns
`{markTones}`, not a function, so the destructuring is not optional:

```javascript
const {markTones} = require('pinyin-tone');
```

## Two one-liners that are not exact

`convertUnspacedPinyin` converted the part it recognised and left the rest alone:
`hanyu3pin1yin1` came back as `hanyu3pīnyīn`. 3.0 is all or nothing, so the replacement
above returns `hanyu3pin1yin1` unchanged. Where the old call gave you half a conversion, you
now get your input back.

`toPinyinTonesVariants` returned `{canonical, literal}` for a whole string. In 3.0 the
literal spelling is asked for per token with a colon, which is why the common case still
fits in one call — `markTones('ju1 ju:1')` is `'jū jǖ'`. A string that needs both spellings
of every syllable is the one case that now takes more than one call.

## The errors, as printed

Nothing fails quietly. The rename is enforced by the module system rather than by a runtime
check, so a name that no longer exists cannot reach production as `undefined`.

| Printed | Caused by |
| --- | --- |
| `SyntaxError: The requested module 'pinyin-tone' does not provide an export named 'default'` | `import anything from 'pinyin-tone'` |
| `SyntaxError: The requested module 'pinyin-tone' does not provide an export named 'v2'` | `import {v2} from 'pinyin-tone'` |
| `ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './v2' is not defined by "exports"` | importing `/v2`, `/v1` or `/workaround` |
| `TypeError: xxx is not a function` | `const fn = require('pinyin-tone'); fn(text)` |
| `error TS2613: Module '…' has no default export` | a default import seen by TypeScript |

## Output that changed

Both comparisons use the same 13,664 inputs: every dictionary key × its seven tone spellings
(no digit, then `0`–`5`).

Against the 2.5.2 root entry, 1,548 of them (11.3%) differ. The sentence "the old one dropped
letters" covers 966 of those; the rest are inputs it did not convert at all (509) and inputs it
spelled with `ü` where 3.0 writes `u` (73):

| Input | 2.5.2 root | 3.0 |
| --- | --- | --- |
| `biou1` | `biū` | `biōu` |
| `biou3` | `biǔ` | `biǒu` |

Against `pinyin-tone/v2`, 259 differ (1.9%), spread over 38 keys in three groups:

| Input | 2.5.2 `/v2` | 3.0 | Reason |
| --- | --- | --- | --- |
| `jv1` | `jǖ` | `jū` | after j, q, x, y the ü is written u |
| `m1` | `m1` | `m̄` | vowel-less interjections take tone marks |
| `e^1` | `e^1` | `ê̄` | the `^` spelling is not recognised; it was never a tone digit |

If a `/v2` call relied on `jv1` producing `jǖ`, the literal spelling is still reachable — it
is asked for with a colon: `markTones('ju:1')` gives `'jǖ'`.

## Check your own input first

Install both versions side by side, the old one under another name:

```bash
npm install pinyin-tone@3 oldpin@npm:pinyin-tone@2.5.2
```

```javascript
// compare.mjs
import oldRoot from 'oldpin';              // the 2.5.2 root entry
import oldV2 from 'oldpin/v2';             // the 2.5.2 /v2 entry
import {markTones} from 'pinyin-tone';

const inputs = [];                         // your own strings, one per element

for (const text of inputs) {
    const now = markTones(text);
    if (now !== oldRoot(text) || now !== oldV2(text)) {
        console.log(JSON.stringify([text, oldRoot(text), oldV2(text), now]));
    }
}
```

A short list means the upgrade is a rename for you. A long one means you depend on the old
output, and the two tables above say which lines to look at.

## Going back

`npm install pinyin-tone@2.5.2` — the `legacy` tag points there — or put `2.5.2` back in
`package.json`; `^2` works too, as nothing in 3.x can match it. Only the `latest` tag moved.
`2.4.1` is still published but deprecated: its `/v2` entry sliced the input instead of parsing
it (`Hao3` came back as `ao`, `toString` as `to`), which is what `2.5.0` fixed.

## Checklist

- every import is `{markTones}`, and no `require()` result is called directly
- no subpath import remains
- the diff list from `compare.mjs` is reviewed
- `strict` and `skip` are new in 3.0 — existing calls need neither, and both default to off
