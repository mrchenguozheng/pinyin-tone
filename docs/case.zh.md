# 大小写

大小写是拼写的一部分，不是装饰。《汉语拼音正词法基本规则》（GB/T 16159）规定：句首和专名的首字母大写，专名也可以整串大写；而标准自己的全大写例子照样带着调号（`BĚIJĪNG`、`LǏ HUÁ`）。全小写、首字母大写、全大写这三种都能转，输出的大小写跟输入走。

English: [case.md](case.md)

```javascript
markTones('Zhong1guo2'); // 'Zhōngguó'
markTones('BEI3JING1');  // 'BĚIJĪNG'
markTones('ni3Hao3');    // 'nǐHǎo'   大小写按音节判断，音节之间可以不一样
markTones('hAo3');       // 'hAo3'    标准里没有这种写法
```

大小写按音节判断，所以 `ZHONG1guo2` 得到 `ZHŌNGguó`。同一个音节里混着大小写（`hAo3`、`HaO3`）不是标准写法，原样返回。

## 全大写代码的代价

带数字的全大写拉丁串和拼音分不开，所以 `A4` 会变成 `À`、`O2` 会变成 `Ó`、`CO2` 会变成 `CÓ`。把输入先转成小写能躲过去，但专名的大小写也一起被抹掉了。更好的办法是把这些代码写进 `skip`，其余文本大小写照旧：

```javascript
markTones('A4');                            // 'À'
markTones('CO2');                           // 'CÓ'
markTones('M2 货币供应量 hao3', {skip: 'M2'});  // 'M2 货币供应量 hǎo'
markTones('M2 A4 N3', {skip: ['M2', 'A4']});    // 'M2 A4 Ň'
```

`skip` 比的是整个片段，而且区分大小写：`'M2'` 碰不到 `M20`（那是另一个片段），也碰不到 `m2`（那是另一个字符串）。详见 [`skip.zh.md`](skip.zh.md)。
