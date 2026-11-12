# pinyin-tone

A lightweight library to algorithmically convert numerical tone notation (e.g., hao3) to standard Pinyin diacritical marks (e.g., hǎo).

Designed for developers and learners who need accurate tone mark formatting in language apps, input methods, or educational tools.

## Setup

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

### Installation via npm:

通过NPM安装：

```bash
npm install pinyin-tone@legacy
```

That is 2.5.0, the last release of the 2.x line — everything on this page documents it. A
plain `npm install pinyin-tone` now installs 3.0, which is a rewrite rather than an upgrade
path: the default export becomes a named one (`import {markTones} from 'pinyin-tone'`), and
`v1`, `v2` and `workaround` are folded into that single function, with no subpaths left.

Code written for 2.x does not run against 3.0 unchanged — it fails on the missing named
export instead of returning something wrong, so the mistake is loud. Migration notes are in
the repository, under
[`docs/migrating.md`](https://github.com/mrchenguozheng/pinyin-tone/blob/master/docs/migrating.md).

Node.js 14 or later (`engines`).

## Usage (Default Behavior)

This module exports a function. You can name it as desired, such as `pinyin`.

Both module systems get that function: `import` reads the ES module, `require` reads a
CommonJS copy generated from it, and the two give the same answers.

```javascript
// CommonJS
var toPinyinTones = require('pinyin-tone');

// ES module
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

// Neutral tone: 0 and 5 mean the same thing
var neutral = toPinyinTones("ma5 ma0"); // -> 'ma ma'

// Full forms of the finals: v1 folds `liou` to `liu` and `yuen` to `yun`,
// v2 spells them out
var liuyun = toPinyinTones("liou2 yuen2"); // -> 'liú yún' (v2: 'lióu yuén')
var iou_uen = toPinyinTones("iou1 uen4"); // -> 'iōu uèn' (pure final only)

// Some less common combinations
var fantastic = toPinyinTones("bong1 tv2 pe3 wir4"); // -> 'bōng tǘ pě wìr'
```

`v1`, `v2` and `workaround` are also available as subpaths, in both systems. Since 2.5.0
there is an `exports` map, so the subpath is the whole path — the older
`pinyin-tone/v2/index.js` spelling now throws `ERR_PACKAGE_PATH_NOT_EXPORTED`.

```javascript
// CommonJS — the subpath itself is callable, and its named exports hang off it
const v2 = require('pinyin-tone/v2');
const convertUnspacedPinyin = require('pinyin-tone/v2').convertUnspacedPinyin;

// ES module
// import v2, {convertUnspacedPinyin} from 'pinyin-tone/v2';

v2('ni3 hao3'); // -> 'nǐ hǎo'
convertUnspacedPinyin('han4yu3pin1yin1'); // -> 'hànyǔpīnyīn'
```

## Usage v2 (Experimental)

`v2` reads syllables from a table instead of matching them with a pattern, so the two agree
on ordinary syllables and differ on the full forms of the finals: `'liou2 yuen2'` comes back
as `'lióu yuén'` where v1 gives `'liú yún'`.

Erhua is written the same way in both — `pinyin-r-number`, as in `huar1`. Neither accepts the
`pinyin-number-r` form (`hua1r`); both hand it back unchanged.

```javascript
// CommonJS — a copy generated from the same source, same answers.
// 2.3.0 through 2.4.x dropped this; 2.5.0 brings it back.
var anotherPinyinTones = require('pinyin-tone/v2');

// ES module
// import anotherPinyinTones from 'pinyin-tone/v2';

console.log(anotherPinyinTones('qi3 lai2 bu2 yuan4 zuo4 nu2 li4 de ren2 men'));
// -> 'qǐ lái bú yuàn zuò nú lì de rén men'

console.log(anotherPinyinTones('huar1 wei4 shen2 me zhe4 yang4 hong2'));
// -> 'huār wèi shén me zhè yàng hóng'
```

## Usage: unspaced input to unspaced output (since v2.4.0)

```javascript
import { convertUnspacedPinyin } from 'pinyin-tone/v2'; // since v2.4.0

console.log(convertUnspacedPinyin('han4yu3pin1yin1')); // hànyǔpīnyīn
console.log(convertUnspacedPinyin('han4 yu3pin1yin1')); // hànyǔpīnyīn
console.log(convertUnspacedPinyin('han4 yu3  pin1   yin1')); // hànyǔpīnyīn

// A syllable with no tone number cannot be delimited: put a space or a `0` after it,
// or the next syllable has no boundary to start from.
console.log(convertUnspacedPinyin('hanyu3pin1yin1')); // hanyu3pīnyīn
// like this
console.log(convertUnspacedPinyin('han yu3pin1yin1')); // hanyǔpīnyīn
// or this
console.log(convertUnspacedPinyin('han0yu3pin1yin1')); // hanyǔpīnyīn
```

## Contributors

![Contributors](https://mrchenguozheng.github.io/pinyin-tone/CONTRIBUTORS.svg "Contributors")

## Contributing

If you find any bugs, glitches, or have feature requests, please [submit them here](https://github.com/mrchenguozheng/pinyin-tone/issues). Thank you!

## Changelog

For update history, see the [CHANGELOG here](https://github.com/mrchenguozheng/pinyin-tone/blob/maintain/2.x/CHANGELOG.md).
That is the 2.x branch's copy — the one on `master` stops at 2.4.1 and then covers 3.x.

## Tests

```bash
npm test
```

That runs mocha, compares the generated CommonJS copies against the sources they came from,
and type-checks both the sources and the `.d.ts` files. The cases are in `test/*.js`.

## License

MIT

## About 汉语拼音方案(hàn yǔ pīn yīn fāng àn)

You can find the official document [汉语拼音方案.pdf] at <http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html>

[汉语拼音方案.pdf]:http://www.moe.gov.cn/ewebeditor/uploadfile/2015/03/02/20150302165814246.pdf
