# `skip`

`M2`, `A4`, `O2` collide with pinyin — `m`, `a` and `o` are syllables on their own, so `M2`
would come out as `Ḿ`. `skip` says which runs to keep as written, once, in the options.

中文: [skip.zh.md](skip.zh.md)

```javascript
markTones('M2 货币供应量 hao3', {skip: 'M2'});   // 'M2 货币供应量 hǎo'
markTones('M2 A4 N3', {skip: ['M2', 'A4']});     // 'M2 A4 Ň'
```

## The rule

A string or an array compares the whole run, case-sensitively: `'M2'` cannot touch `M20`
(a different run) or `m2` (a different string). That is the entire rule — no patterns, no
predicates, and no marker characters inside the text.

## A rule is per run

A rule covers every occurrence of that run: the text `M2 M2` gives `M2 M2`, never one of
each. If a call needs both outcomes, cut the text and call once per part.

```javascript
markTones('M2 M2', {skip: 'M2'});  // 'M2 M2'
```

A rule is only asked about runs that would otherwise be converted, which is a performance
shortcut, not a second rule.

## No marker characters in the text

Because the text carries no markers, ordinary content passes through exactly as written:

```javascript
markTones('C:\\Users');        // unchanged — a path
markTones('\\texttt{nǐ}');     // unchanged — a LaTeX command
markTones('\\ni3');            // '\\nǐ'    — the backslash is an ordinary character
```

The last case is worth spelling out: a backslash does not protect anything. A segment that
looks like a syllable still gets its tone mark, however it is prefixed. If you need it kept,
name it in `skip` — that is the only channel for "leave this alone", which keeps the input
free of instructions.

## Why not a `RegExp`

A regex is deliberately not accepted: a regex reads as "search the text", while a rule here
only ever sees one run. A lookbehind such as `(?<=今天 )` could never match, and `^`/`$`
would anchor at the run's ends rather than the text's. Both fail silently, which is worse
than not being supported at all.

A function predicate is not accepted either — it turns a declarative option into imperative
code, and the same per-run limit applies. Passing `RegExp`, a function, `true`, `{}` or an
empty array is the same as not passing the option at all; a non-string item inside an array
is dropped.

## Deliberately not offered

Two other ways of saying "leave this alone" are not offered: an `onSkip` callback, and paired
`{{ }}` markers. Between them they would add a callback concept and a second parsing layer
for a case that a `skip` list already handles — the caller has the text in hand and can
compute the list itself, for example
`[...text.matchAll(/[A-Z]{1,2}[1-5]/g)].map((m) => m[0])`.
