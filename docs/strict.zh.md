# `strict` 模式

词表是故意放宽的：1952 个键里，有 876 个能过 `strict`——也就是普通话的 426 个音节，加上由这些音节决定的儿化形式和字面 `jv` 写法。剩下 1076 个分三种：声母和韵母的笛卡尔积（`jui`、`juang`、`biong`）、确实有人在用的非标准写法（`duang`、`biu`），以及把 `v` 当辅音用的组合（`vai`、`bvan`）。

默认全都转换。打开 `strict: true` 就只转那 876 个，其余原样返回。

English: [strict.md](strict.md)

```javascript
markTones('jui1');                   // 'juī'
markTones('duang1');                 // 'duāng'
markTones('jui1', {strict: true});   // 'jui1'  不是音节，原样返回
markTones('duang1', {strict: true}); // 'duang1'
markTones('huar1', {strict: true});  // 'huār'  hua 是音节，huar 也就成立
markTones('e^2', {strict: true});    // 'ế'     ê 是独立韵母
```

## 怎么判

儿化过不过，看它的基础音节：`huar` 合法，是因为 `hua` 合法。字面写法在判定前先转成规范写法，所以两种模式下结果一样。只要有一个音节被拒，整段就原样返回——跟别处一样，要么整段转，要么一点不转。

选项默认 `false`。传非布尔值会被忽略，不会强行当成真。

## 什么时候用它

输入是程序生成的规范拼音，你宁可让可疑的东西原样留着，也不想它被转成一个「看着像个词」的结果，那就打开它。输入是人写的、可能故意用了非标准写法，就用默认设置。
