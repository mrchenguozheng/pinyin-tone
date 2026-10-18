# 边界情况：数字、`_`、空格

README 只讲了最常用的一条路。这一页把扫描和切分讲全：片段从哪儿开始、到哪儿结束，数字和下划线怎么算，空格和切点有哪些细节。

English: [edge-cases.md](edge-cases.md)

## 怎么扫

整段文本按「字母（`A`–`Z`、`a`–`z`）、`:`、`^`、数字 `0`–`5`」切成片段。片段之外的东西——汉字、标点、空白——原样复制。每个片段再按声调数字切成音节。

一个音节分三截：主体字母，可选的标记（`^` 表示 `ê`，`:` 表示字面写法的 `ü`），可选的数字 `0`–`5`。一个片段里只要有一处识别不出来，整段就原样返回，不会只转半截。

```javascript
markTones('ni3hao3');        // 'nǐhǎo'    每个音节都有数字，够切了
markTones('ni3 hao3');       // 'nǐ hǎo'   空格只是片段之间的文本
markTones('ni3,hao3');       // 'nǐ,hǎo'   标点留着，两边都转
markTones('a1b2c3');         // 'a1b2c3'   b 和 c 不成音节，整段不动
markTones('hanyu3pin1yin1'); // 原样        hanyu 里没有数字，切不开
markTones('今天ni3hao3');     // '今天nǐhǎo' 汉字不算在片段里
```

## `0`–`5` 以外的数字

`0`–`5` 以外的数字不算在片段里。它自己就是一条边界，也不会被吃掉，`ma6` 原样返回。数字属于 ASCII 的词字符，所以紧挨着数字的片段也不转换：

```javascript
markTones('ma6');      // 'ma6'     6 不是声调，也不会被吃掉
markTones('ni3ma6');   // 'ni3ma6'  挨着数字，就不再是独立片段
markTones('ni3 ma6');  // 'nǐ ma6'  隔了空格，ni3 单独转
```

## `_` 会让它变成标识符

`_` 同样算词字符：`ni3_hao3` 被当成一个标识符，而不是两个音节，所以原样返回。

```javascript
markTones('ni3_hao3');  // 'ni3_hao3'
```

## 空格

空格不会增加、删除，也不会合并：写什么得到什么，连续空格和首尾空白也一样。

```javascript
markTones('han4yu3pin1yin1');        // 'hànyǔpīnyīn'
markTones('han4 yu3  pin1   yin1');  // 'hàn yǔ  pīn   yīn'
```

连写的输入能直接用，因为数字就是切点。要不要连成一串，在调用处决定：

```javascript
markTones('han4 yu3pin1yin1').replace(/ /g, '');  // 'hànyǔpīnyīn'
```

## 哪儿可以省掉数字

数字不能省，只有末尾那一截可以不写：

```javascript
markTones('ni3hao3ma');   // 'nǐhǎoma'   末尾可以不带声调
markTones('ni3haoma5');   // 'ni3haoma5' haoma 不成音节，整段识别不出来
```

切不开的片段（`hanyu3pin1yin1`）原样返回，不会去猜。

## 怎么断句又不加空格

在没有声调数字的音节后面补一个 `0`，既能断开，又不往输出里加空格。用空格断也行，但空格会留在输出里。

```javascript
markTones('han0yu3pin1yin1');  // 'hanyǔpīnyīn' 0 只用来断开，自己不出现
markTones('han yu3pin1yin1');  // 'han yǔpīnyīn' 空格留在输出里
```
