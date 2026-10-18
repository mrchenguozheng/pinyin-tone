# 大小写

大小写是拼写的一部分，不是装饰。《汉语拼音正词法基本规则》（GB/T 16159）把大写放在句首、专名的首字母上，并允许专名全部大写——而它自己的全大写例子仍然带着调号（`BĚIJĪNG`、`LǏ HUÁ`）。三种形态都转换，且形态会原样带回输出。

English: [case.md](case.md)

```javascript
markTones('Zhong1guo2'); // 'Zhōngguó'
markTones('BEI3JING1');  // 'BĚIJĪNG'
markTones('ni3Hao3');    // 'nǐHǎo'   形态按音节判定，所以音节之间可以不同
markTones('hAo3');       // 'hAo3'    标准里没有这种写法
```

形态是按音节读的，所以 `ZHONG1guo2` 得到 `ZHŌNGguó`。同一个音节内混用大小写（`hAo3`、`HaO3`）不是标准定义的写法，原样返回。

## 全大写代码的代价

带数字的全大写拉丁串，和拼音区分不开，所以 `A4` 会变成 `À`、`O2` 会变成 `Ó`、`CO2` 会变成 `CÓ`。把输入先转小写是一种解法，但它也会把你本想保留的专名大小写一并抹平；更好的办法是把这些代码列进 `skip`，其余文本照旧保留大小写。

```javascript
markTones('A4');                            // 'À'
markTones('CO2');                           // 'CÓ'
markTones('M2 货币供应量 hao3', {skip: 'M2'});  // 'M2 货币供应量 hǎo'
markTones('M2 A4 N3', {skip: ['M2', 'A4']});    // 'M2 A4 Ň'
```

`skip` 比的是整个片段，并且区分大小写：`'M2'` 碰不到 `M20`（另一个片段），也碰不到 `m2`（另一个字符串）。详见 [`skip.zh.md`](skip.zh.md)。
