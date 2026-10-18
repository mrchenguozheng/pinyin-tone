# `strict` 模式

词表是刻意宽松的：1952 个键，其中 876 个能通过 `strict`——也就是普通话的 426 个音节，加上由投影得到的儿化形式与字面 `jv` 拼写。另外 1076 个是声母 × 韵母的笛卡尔积（`jui`、`juang`、`biong`）、现实中存在的非标准拼写（`duang`、`biu`），或者把 `v` 当辅音用的组合（`vai`、`bvan`）。

默认情况下它们全都转换。`strict: true` 只转那 876 个，其余原样返回。

English: [strict.md](strict.md)

```javascript
markTones('jui1');                   // 'juī'
markTones('duang1');                 // 'duāng'
markTones('jui1', {strict: true});   // 'jui1'  不是音节，原样
markTones('duang1', {strict: true}); // 'duang1'
markTones('huar1', {strict: true});  // 'huār'  hua 是音节，所以 huar 也是
markTones('e^2', {strict: true});    // 'ế'     ê 是独立韵母
```

## 判定的方式

儿化由它的基底决定：`huar` 合法，正是因为它对应的 `hua` 合法。字面拼写在判定前先投影到规范形式，所以在两种模式下表现一致。只要有一个音节被拒，整个片段就原样返回——和别处一样的全有或全无。

选项默认 `false`，传非布尔值会被忽略，而不是强制转换。

## 什么时候用它

当输入是程序生成的规范拼音，而你宁愿可疑的东西原样留着、也不要它被转成一个「看着像个词」的输出时，打开它。当输入是人写的、可能故意用了非标准拼写时，保持默认。
