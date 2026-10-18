# pinyin-tone

A lightweight library to algorithmically convert numerical tone notation (e.g., hao3) to standard Pinyin diacritical marks (e.g., hǎo).

Designed for developers and learners who need accurate tone mark formatting in language apps, input methods, or educational tools.

## Setup

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

### Installation via npm:

通过NPM安装：

```bash
npm install pinyin-tone
```

## Public API (公开接口)

Only the entry points declared in `package.json` → `exports` are supported public API:

| Import path | Provides |
| --- | --- |
| `pinyin-tone` | v1 converter (default) plus named `v2` and `markSinglePinyinVowel` |
| `pinyin-tone/v2` | v2 converter (default), `splitUnspacedSyllables`, `convertUnspacedPinyin` |
| `pinyin-tone/v1` | v1 converter (default) |
| `pinyin-tone/workaround` | `markSinglePinyinVowel` (default) |

The `.js`-suffixed equivalents (`pinyin-tone/v2/index.js`, `pinyin-tone/v1/index.js`,
`pinyin-tone/workaround/index.js`) resolve to the same files and are equally supported.

**Everything else inside the package is private implementation.** Any other subpath is not
part of the API — including files you can see in `node_modules`, such as
`pinyin-tone/v2/b.js` or `pinyin-tone/v2/dict.js`.

**Do not import those private paths.** Doing so yields undefined and untrustworthy
results: the files may be moved, renamed, or deleted in any release, and your code will
fail with `ERR_PACKAGE_PATH_NOT_EXPORTED` or `ERR_MODULE_NOT_FOUND`. The internal layout
of the dictionary — how it is split across files, its table shape, its key order — is
**not** a contract and changes without notice.

**This release is a breaking change.** The 51 per-initial tables under `v2/`
(`v2/b.js`, `v2/zh.js`, `v2/special.js`, …) are no longer published. They were never
documented and never were public API. Code that deep-imported them will break; migrate to
one of the four entry points above.

**中文说明：** 只有上表列出的四个入口是公开接口，包内其他任何路径（含 `v2/` 目录下的文件）
都属于私有实现，随时可能被移动、改名或删除。依赖它们会得到**未定义、不可信的结果或直接报错**。
本次版本已移除 `v2/` 下的 51 个分声母词表，这是 **breaking change**；如需迁移，请改用上表入口。

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

## Usage: convert unspaced syllables string to unspaced pinyin string (since v2.4.0)

```javascript
import { convertUnspacedPinyin } from 'pinyin-tone/v2'; // since v2.4.0

console.log(convertUnspacedPinyin('han4yu3pin1yin1')); // hànyǔpīnyīn
console.log(convertUnspacedPinyin('han4 yu3pin1yin1')); // hànyǔpīnyīn
console.log(convertUnspacedPinyin('han4 yu3  pin1   yin1')); // hànyǔpīnyīn

// always add a space or a `0` between two syllables if the first syllable does not end with a tone number
console.log(convertUnspacedPinyin('hanyu3pin1yin1')); // hanyu3pīnyīn
// like this
console.log(convertUnspacedPinyin('han yu3pin1yin1')); // hanyǔpīnyīn
// or this
console.log(convertUnspacedPinyin('han0yu3pin1yin1')); // hanyǔpīnyīn
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
