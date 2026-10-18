# 边界情况：数字、`_`、空格

README 只讲常用路径。这一页是「扫描与切分」的完整规则——片段从哪里开始、到哪里结束，数字和下划线怎么处理，空格和切点有哪些细节。

English: [edge-cases.md](edge-cases.md)

## 扫描

整段文本按「字母（`A`–`Z`、`a`–`z`）/ `:` / `^` / 数字 `0`–`5`」切成片段。片段之外的一切——汉字、标点、空白——逐字照抄。每个片段再按声调数字切成音节。

一个音节 = 基底 + 可选标记（`^` 表示 `ê`，`:` 表示字面 `ü`）+ 可选数字 `0`–`5`。认不全的片段整段原样返回，绝不输出半截。

```javascript
markTones('ni3hao3');        // 'nǐhǎo'    每个音节一个数字就够切
markTones('ni3 hao3');       // 'nǐ hǎo'   空格只是片段之间的文本
markTones('ni3,hao3');       // 'nǐ,hǎo'   标点留着，两边都转
markTones('a1b2c3');         // 'a1b2c3'   b 和 c 不成音节，整段不动
markTones('hanyu3pin1yin1'); // 原样        hanyu 里没有数字可以切
markTones('今天ni3hao3');     // '今天nǐhǎo' 汉字不属于任何片段
```

## `0`–`5` 之外的数字

`0`–`5` 之外的数字不属于任何片段，所以它自己就是一个边界，也不会被吞掉（`ma6` 原样返回）。数字算 ASCII 词字符，所以紧贴数字的片段也不动：

```javascript
markTones('ma6');      // 'ma6'     6 不是声调，也不会被吃掉
markTones('ni3ma6');   // 'ni3ma6'  片段贴着数字，就不成片段
markTones('ni3 ma6');  // 'nǐ ma6'  有空格隔开，ni3 单独转换
```

## `_` 让它变成标识符

同一条「词字符」规则适用于 `_`：`ni3_hao3` 读作一个标识符，而不是两个音节，原样返回。

```javascript
markTones('ni3_hao3');  // 'ni3_hao3'
```

## 空格

空格不增、不删、不合并——你写的是什么就得到什么，包括连续空格和首尾空白。

```javascript
markTones('han4yu3pin1yin1');        // 'hànyǔpīnyīn'
markTones('han4 yu3  pin1   yin1');  // 'hàn yǔ  pīn   yīn'
```

连写输入可以直接用，因为数字就是切点；要不要粘连由调用方决定：

```javascript
markTones('han4 yu3pin1yin1').replace(/ /g, '');  // 'hànyǔpīnyīn'
```

## 哪里可以省数字

数字不能省，只有片段的最后一段可以省：

```javascript
markTones('ni3hao3ma');   // 'nǐhǎoma'   最后一段可以没有声调
markTones('ni3haoma5');   // 'ni3haoma5' haoma 不成音节，整段认不出来
```

没有切点的片段（`hanyu3pin1yin1`）原样返回，而不是去猜。

## 分隔但不产生空格

在无声调的音节后面补一个 `0`，就能分隔而不加空格。用空格分隔也行，但空格会留在输出里。

```javascript
markTones('han0yu3pin1yin1');  // 'hanyǔpīnyīn' 0 起到分隔作用，自身不出现
markTones('han yu3pin1yin1');  // 'han yǔpīnyīn' 空格留在输出里
```
