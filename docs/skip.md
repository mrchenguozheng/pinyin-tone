# `skip`

`M2`, `A4`, `O2` collide with pinyin — `m`, `a` and `o` are syllables on their own, so `M2`
would come out as `Ḿ`. `skip` says which runs to keep as written, once, in the options.

```javascript
markTones('M2 货币供应量 hao3', {skip: 'M2'});   // 'M2 货币供应量 hǎo'
markTones('M2 A4 N3', {skip: ['M2', 'A4']});     // 'M2 A4 Ň'
```

中文：`M2`、`A4`、`O2` 这类「全大写拉丁串 + 数字」与拼音撞车（`m`、`a`、`o` 本身就是音节，`M2` 会变成 `Ḿ`），用 `skip` 在选项里说一次要保留哪些片段。

## The rule

A string or an array compares the whole run, case-sensitively: `'M2'` cannot touch `M20`
(a different run) or `m2` (a different string). That is the entire rule — no patterns, no
predicates, and no marker characters inside the text.

中文：只收字符串与字符串数组，比的是**整个片段**、区分大小写 —— `'M2'` 碰不到 `M20`（那是另一个片段），也碰不到 `m2`。规则就这一条，没有模式、没有谓词、输入里不写标记字符。

## A rule is per run

A rule covers every occurrence of that run: the text `M2 M2` gives `M2 M2`, never one of
each. If a call needs both outcomes, cut the text and call once per part.

```javascript
markTones('M2 M2', {skip: 'M2'});  // 'M2 M2'
```

中文：规则以片段为单位，覆盖该片段的每一次出现：`M2 M2` 得到 `M2 M2`，不会「保一个转一个」；一次调用里要两种结果就把文本切开分别调用。

A rule is only asked about runs that would otherwise be converted, which is a performance
shortcut, not a second rule.

中文：只有本来会转换的片段才会去问规则——这是纯性能捷径，不构成第二条语义。

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

中文：输入里不含任何标记字符，所以普通内容原样通过（路径 `C:\Users`、LaTeX 命令 `\texttt{nǐ}`）。最后一条值得单说：反斜杠不保护任何东西，看起来像音节的片段照旧标调，不论前面加什么。要保留就写进 `skip` —— 那是「别动它」的唯一通道，输入因此保持不含指令。

## Why not a `RegExp`

A regex is deliberately not accepted: a regex reads as "search the text", while a rule here
only ever sees one run. A lookbehind such as `(?<=今天 )` could never match, and `^`/`$`
would anchor at the run's ends rather than the text's. Both fail silently, which is worse
than not being supported at all.

A function predicate is not accepted either — it turns a declarative option into imperative
code, and the same per-run limit applies. Passing `RegExp`, a function, `true`, `{}` or an
empty array is the same as not passing the option at all; a non-string item inside an array
is dropped.

中文：**不收正则**：正则读起来是「在整段文本里找」，而这里只看得到单个片段 —— `(?<=今天 )` 这种环视永远匹配不上，`^`/`$` 锚在片段两端而不是文本两端，两者都是「写得像对的、其实不生效」。**不收函数谓词**：它把声明式退回命令式，而且同样受片段级粒度的限制。传 `RegExp`、函数、`true`、`{}`、空数组都等于没传；数组里的非字符串项会被丢掉。

## Coverage gaps

A few ways to keep something unchanged are deliberately not offered: an `onSkip` callback,
and paired `{{ }}` markers. Between them they would add a callback concept and a second
parsing layer for a case that a `skip` list already handles — the caller has the text in
hand and can compute the list itself, for example
`[...text.matchAll(/[A-Z]{1,2}[1-5]/g)].map((m) => m[0])`.

中文：刻意不提供两种「保持原样」的写法：`onSkip` 回调与成对的 `{{ }}` 标记。它们会为一个 `skip` 列表已经覆盖的场景再引入一个回调概念和一层解析；调用方手上就有文本，可以自己算出这个列表。
