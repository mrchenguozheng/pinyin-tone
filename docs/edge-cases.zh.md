# 边界情况：数字、`_`、空格

README 只讲常用的那条路径。这一页把「扫描与切分」的规则写全：片段从哪里开始、到哪里结束，数字和下划线怎么处理，空格和切点有哪些细节。

English: [edge-cases.md](edge-cases.md)

## 扫描

整段文本按「字母（`A`–`Z`、`a`–`z`）、`:`、`^`、数字 `0`–`5`」切成片段。片段之外的内容——汉字、标点、空白——原样复制。每个片段再按声调数字切成音节。

一个音节由三部分组成：主体字母，可选的标记（`^` 表示 `ê`，`:` 表示字面写法的 `ü`），以及可选的数字 `0`–`5`。一个片段里只要有一处识别不出来，整个片段就原样返回，不会只转一半。

```javascript
markTones('ni3hao3');        // 'nǐhǎo'    每个音节带一个数字，就够切了
markTones('ni3 hao3');       // 'nǐ hǎo'   空格只是片段之外的文本
markTones('ni3,hao3');       // 'nǐ,hǎo'   标点原样留着，两边都转换
markTones('a1b2c3');         // 'a1b2c3'   b 和 c 不成音节，整个片段不动
markTones('hanyu3pin1yin1'); // 原样        hanyu 里没有数字可切
markTones('今天ni3hao3');     // '今天nǐhǎo' 汉字不属于任何片段
```

## `0`–`5` 之外的数字

`0`–`5` 之外的数字不属于任何片段，它自己就是一个边界，也不会被吞掉（`ma6` 原样返回）。数字算 ASCII 的词字符，所以紧贴着数字的片段也不转换：

```javascript
markTones('ma6');      // 'ma6'     6 不是声调，也不会被吃掉
markTones('ni3ma6');   // 'ni3ma6'  贴着数字就不再是独立片段
markTones('ni3 ma6');  // 'nǐ ma6'  有空格隔开，ni3 单独转换
```

## `_` 让它变成标识符

`_` 也受同一条「词字符」规则约束：`ni3_hao3` 会被当成一个标识符，而不是两个音节，所以原样返回。

```javascript
markTones('ni3_hao3');  // 'ni3_hao3'
```

## 空格

空格不会增加、删除或合并——写什么就得到什么，连续空格和首尾空白也一样。

```javascript
markTones('han4yu3pin1yin1');        // 'hànyǔpīnyīn'
markTones('han4 yu3  pin1   yin1');  // 'hàn yǔ  pīn   yīn'
```

连写的输入可以直接用，因为数字就是切点；要不要连成一串由调用处决定：

```javascript
markTones('han4 yu3pin1yin1').replace(/ /g, '');  // 'hànyǔpīnyīn'
```

## 哪里可以省数字

数字不能省略，只有片段的最后一段可以没有：

```javascript
markTones('ni3hao3ma');   // 'nǐhǎoma'   最后一段可以不带声调
markTones('ni3haoma5');   // 'ni3haoma5' haoma 不成音节，整个片段识别不出来
```

找不到切点的片段（`hanyu3pin1yin1`）原样返回，不会去猜。

## 分隔但不产生空格

在没有声调数字的音节后面补一个 `0`，就能起到分隔作用，又不会在输出里加空格。用空格分隔也可以，但空格会留在输出里。

```javascript
markTones('han0yu3pin1yin1');  // 'hanyǔpīnyīn' 0 起到分隔作用，自身不出现
markTones('han yu3pin1yin1');  // 'han yǔpīnyīn' 空格留在输出里
```
