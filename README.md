# pinyin-tone

* Another wheel that converts Hanyu pinyin "tone numbers" to "tone marks".
* 又一个把“汉语拼音声调数字”转换成“声调符号”的轮子。

* I assume you already know what [拼音(Pinyin)](https://en.wikipedia.org/wiki/Pinyin) is and how to write correct pinyin.
* 假设您已经知道什么是[拼音(Pinyin)](https://en.wikipedia.org/wiki/Pinyin)、知道如何写正确的拼音。

## Setup

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

* via npm:
* 通过NPM安装：

```bash
npm install pinyin-tone
```

## Usage (default)

```javascript
// this module exports a function, name it as `pinyin` or what you like.
var toPinyinTones = require('pinyin-tone'); // CommonJS usage, up to version 2.2.7
import toPinyinTones from 'pinyin-tone';    // ES Module usage, BREAKING CHANGE from version 2.3.0

// call the function
var hatsune_miku = toPinyinTones('chu1 yin1 wei4 lai2'); // ---> 'chū yīn wèi lái'
var megurine_luka = toPinyinTones("xun2 yin1 liu2 ge1"); // ---> 'xún yīn liú gē'
var han = toPinyinTones("han4 yu3 pin1 yin1 fang1 an4"); // ---> 'hàn yǔ pīn yīn fāng àn'

// 儿化音(ér huà yīn)
var huar = toPinyinTones("huar1 renr2 shuir3 yuer4"); // ---> 'huār rénr shuǐr yuèr'

// 声母(shēng mǔ)
var bpmf = toPinyinTones("b p m f"); // ---> 'b p m f'

// 韵母(yùn mǔ)
var yun = toPinyinTones("an1 vn2 ong3 uen4"); // ---> 'ān ǘn ǒng uèn'

// special
var liuyun = toPinyinTones("liou2 yuen2"); // ---> 'liú yún' // use in reality
var iou_uen = toPinyinTones("iou1 uen4"); // ---> 'iōu uèn' // only yùn mǔ

// or some pinyin that not used in reality.
var fantastic = toPinyinTones("bong1 tv2 pe3 wir4"); // ---> 'bōng tǘ pě wìr'
```

## Usage v2 (exprimental)

As a result, there is ONE difference between `v1` and `v2`. `v2` does NOT support 儿化音 like `hua1r` (format: `pinyin-number-r`), it only supports the format `pinyin-r-number` like `huar1`.

```javascript
var anotherPinyinTones = require('pinyin-tone/v2'); // CommonJS usage, up to version 2.2.7
import anotherPinyinTones from 'pinyin-tone/v2';    // ES Module usage, BREAKING CHANGE from version 2.3.0

console.log(anotherPinyinTones('qi3 lai2 bu2 yuan4 zuo4 nu2 li4 de ren2 men')); // --> 'qǐ lái bú yuàn zuò nú lì de rén men'
console.log(anotherPinyinTones('huar1 wei4 shen2 me zhe4 yang4 hong2')); // --> 'huār wèi shén me zhè yàng hóng'
```

## Changelog

* 更新日志 see [CHANGELOG here](https://github.com/mrchenguozheng/pinyin-tone/blob/master/CHANGELOG.md).

## Tests

see `test/test.js`.

* 重写了测试 Rewrite tests. 2025-03-16

## Issues

* submit any [bugs/glitches/issues about this package here](https://github.com/mrchenguozheng/pinyin-tone/issues). Thank you!
* 有任何与此包相关的疑问或者代码缺陷请[在这里提交](https://github.com/mrchenguozheng/pinyin-tone/issues)。感谢！

## License

* MIT

## About 汉语拼音方案(hàn yǔ pīn yīn fāng àn)

You can find [汉语拼音方案.pdf] in <http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html>

[汉语拼音方案.pdf]:http://www.moe.gov.cn/ewebeditor/uploadfile/2015/03/02/20150302165814246.pdf
