# pinyin-tone

A tool to convert "Hanyu Pinyin Tone Numbers" to "Tone Marks".

We assume you already know what [拼音(Pinyin)](https://en.wikipedia.org/wiki/Pinyin) is and how to write it correctly.

一个将“汉语拼音声调数字”转换为“声调符号”的工具库。

假设您已经了解[拼音(Pinyin)](https://en.wikipedia.org/wiki/Pinyin)的基本规则，并能写正确书写拼音。

## Setup

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

### Installation via npm:

通过NPM安装：

```bash
npm install pinyin-tone
```

## Usage (Default Behavior)

This module exports a function. You can name it as desired, such as `pinyin`.

```javascript
// CommonJS usage (up to version 2.2.7)
var toPinyinTones = require('pinyin-tone');

// /* or ES Module usage (breaking change in version 2.3.0+) */
// import toPinyinTones from 'pinyin-tone';

// Examples
var hatsune_miku = toPinyinTones('chu1 yin1 wei4 lai2'); // -> 'chū yīn wèi lái'
var megurine_luka = toPinyinTones("xun2 yin1 liu2 ge1"); // -> 'xún yīn liú gē'
var han = toPinyinTones("han4 yu3 pin1 yin1 fang1 an4"); // -> 'hàn yǔ pīn yīn fāng àn'

// Erhua / 儿化音 (ér huà yīn)
var huar = toPinyinTones("huar1 renr2 shuir3 yuer4"); // -> 'huār rénr shuǐr yuèr'

// Initials / 声母 (shēng mǔ)
var bpmf = toPinyinTones("b p m f"); // -> 'b p m f'

// Finals / 韵母 (yùn mǔ)
var yun = toPinyinTones("an1 vn2 ong3 uen4"); // -> 'ān ǘn ǒng uèn'

// Special cases
var liuyun = toPinyinTones("liou2 yuen2"); // -> (only in v2) 'lióu yuén'
var iou_uen = toPinyinTones("iou1 uen4"); // -> 'iōu uèn' (pure final only)

// Some less common combinations
var fantastic = toPinyinTones("bong1 tv2 pe3 wir4"); // -> 'bōng tǘ pě wìr'
```

## Usage v2 (Exprimental)

There is one key difference between `v1` and `v2`:

v2 does not support the format `pinyin-number-r` (e.g., `hua1r`) for erhua pronunciation.

Instead, it supports the format `pinyin-r-number`, such as `huar1`.

```javascript
// CommonJS usage (up to version 2.2.7)
var anotherPinyinTones = require('pinyin-tone/v2');

// ES Module usage (breaking change in version 2.3.0)
import anotherPinyinTones from 'pinyin-tone/v2';

console.log(anotherPinyinTones('qi3 lai2 bu2 yuan4 zuo4 nu2 li4 de ren2 men'));
// -> 'qǐ lái bú yuàn zuò nú lì de rén men'

console.log(anotherPinyinTones('huar1 wei4 shen2 me zhe4 yang4 hong2'));
// -> 'huār wèi shén me zhè yàng hóng'
```

## Contributors

![Contributors](CONTRIBUTORS.svg "Contributors")

## Contributing

If you find any bugs, glitches, or have feature requests, please [submit them here](https://github.com/mrchenguozheng/pinyin-tone/issues). Thank you!

## Changelog

For update history, see the [CHANGELOG here](https://github.com/mrchenguozheng/pinyin-tone/blob/master/CHANGELOG.md).

## Tests

see `test/*.js`.

Tests have been rewritten. — 2025-03-16

## License

MIT

## About 汉语拼音方案(hàn yǔ pīn yīn fāng àn)

You can find the official document [汉语拼音方案.pdf] at <http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html>

[汉语拼音方案.pdf]:http://www.moe.gov.cn/ewebeditor/uploadfile/2015/03/02/20150302165814246.pdf
