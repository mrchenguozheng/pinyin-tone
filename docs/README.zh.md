# pinyin-tone

把 `hao3` 这种数字声调写法转成带调号的 `hǎo`。只有一个函数，没有依赖，连写和夹汉字的文本都能直接传进去。

English: [../README.md](../README.md) —— 英文版是 npm 包与首页的默认版本

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

## 安装

```bash
npm install pinyin-tone
```

需要 Node.js 14 或更高版本（`engines`）。ESM 和 CommonJS 都能用，两种写法都得按名字取 `markTones`（**没有默认导出**）。`require()` 加载的是 `dist/index.cjs`，它由 `lib/` 在发布前生成，并且和 `lib/` 逐条比对过，跑的就是同一份代码，不是另写的一份。

```javascript
import {markTones} from 'pinyin-tone';          // ESM
const {markTones} = require('pinyin-tone');     // CommonJS

markTones('chu1 yin1 wei4 lai2');  // 'chū yīn wèi lái'
markTones('jv1 ju1 ju:1');         // 'jū jū jǖ'
markTones('今天ni3hao3');          // '今天nǐhǎo'
```

## API

```typescript
markTones(text: string, options?: {strict?: boolean, skip?: string | readonly string[]}): string
```

| 选项 | 类型 | 默认 | 作用 |
| --- | --- | --- | --- |
| `strict` | `boolean` | `false` | 只转普通话的 426 个音节，以及由这些音节派生出的儿化与字面 `jv` 写法 |
| `skip` | `string \| readonly string[]` | 无 | 与声明一字不差（区分大小写）的片段保持原样 |

两个选项都可以不写；不写时，凡是能识别出来的片段都会转换。其他写法一律当作没传：不认识的字段、不是布尔的 `strict`、既不是字符串也不是数组的 `skip`。选项不该在你没打算的时候改变转换结果。

函数名说的是这个调用**做了什么**，不是这个包是什么：它给已经用 ASCII 写好的拼音（`hao3`、`jv`、`e^`）**加**上调号。它不做汉字转拼音，也不替你猜没写的声调：`ma` 还是 `ma`。

## 一段文本是怎么读的

整段文本先扫描一遍，找出由「字母、`:`、`^`、`0`–`5`」组成的片段。片段之外的内容——汉字、标点、空白——原样复制。每个片段再按声调数字切成音节；一个片段里有任何地方识别不出来，整个片段就原样返回，不会只转一半。

```javascript
markTones('ni3hao3');         // 'nǐhǎo'    数字就是切点
markTones('ni3,hao3');        // 'nǐ,hǎo'   标点原样留着，两边都转换
markTones('hanyu3pin1yin1');  // 原样        没有数字可切
markTones('今天ni3hao3');      // '今天nǐhǎo' 汉字不属于任何片段
markTones('ni3_hao3');        // 原样        下划线让它被当成标识符
```

空格不会增加、删除或合并。真正需要记住的只有三件事：

- **找不到切点的片段，不猜。** `hanyu3pin1yin1` 里，`hanyu` 中间没有数字，整个片段原样返回。
- **数字不能省略，只有片段的最后一段可以没有。** `ni3hao3ma` → `nǐhǎoma`；`ni3haoma5` 原样返回。
- **要连成一串，就在调用处处理。** 用 `markTones(x).replace(/ /g, '')`；或者在后面没有数字的音节后补一个 `0` 当分隔符，这样输出里不会多出空格：`han0yu3pin1yin1` → `hanyǔpīnyīn`。

## `ü` 的两种拼写

`j`/`q`/`x`/`y` 后面的 `ü` 有两种输入写法：规范写法（`ju`）和字面写法（`jv`）；输出一律是规范写法。`n`/`l` 后面则要区分：`nv3` 是 `nǚ`，`nu3` 是 `nǔ`。

冒号代表 `ü` 上面那两点：`ju:1` 得到 `jǖ`。冒号只有两个合法位置——紧跟在它所属的 `u`/`v` 后面，或者在整个音节末尾；写在别处，整个音节原样返回。

```javascript
markTones('jv1');          // 'jū'        字面写法输入，规范写法输出
markTones('jv1 ju1 ju:1'); // 'jū jū jǖ'  两种写法可以出现在同一行
markTones('lu:e4');        // 'lüè'       冒号后面的字母仍属于同一个韵母
```

## 中英混排

汉字不属于任何片段，紧贴着汉字的拼音会就地转换：不用预处理，也不用换一个入口函数。

```javascript
markTones('ju是规范写法，而ju:1是不规范写法');
// -> 'ju是规范写法，而jǖ是不规范写法'
```

贴在英文单词上的 `abcju1`/`ju1abc` 不转换，没有声调数字的 `ju` 也不转换。

## 两个容易踩的坑

**全大写的拉丁串会和拼音撞上。** `M2`、`A4`、`O2` 在这个库里会被当成拼音，因为 `m`、`a`、`o` 本身就是音节：`M2` 变成 `Ḿ`，`CO2` 变成 `CÓ`。把这些代码写进 `skip` 就行，输入里不需要任何标记字符：

```javascript
markTones('M2 货币供应量 hao3', {skip: 'M2'});  // 'M2 货币供应量 hǎo'
markTones('M2 A4 N3', {skip: ['M2', 'A4']});    // 'M2 A4 Ň'
```

`skip` 比较的是整个片段，并且区分大小写：`'M2'` 碰不到 `M20`（另一个片段），也碰不到 `m2`（另一个字符串）。

**规则的作用单位是片段。** 一条规则对该片段的每一次出现都生效：`M2 M2` 得到 `M2 M2`，不会「保留一个、转换另一个」。如果一次调用里需要两种结果，把文本切开，分别调用。

## 从 2.x 迁移

3.0 的根入口就是 2.x 里 `pinyin-tone/v2` 那份实现，同时把两个入口合成了一个：紧贴汉字的拼音以前要改用 `Inline` 版本，现在不用了。把每个词表键的七种声调写法拼成 13664 个输入，逐条对比，两者有 11.3% 的结果不同；差异都是 3.0 修掉了旧实现丢字母的情况（`biou1`：2.x 给 `biū`，3.0 给 `biōu`）。需要旧输出，请锁定 `pinyin-tone@2.4.1`。

| 2.x | 3.0 |
| --- | --- |
| `pinyin-tone/v2`（别名） | 根入口 |
| `import {v2} from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import toPinyinTones from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import {markSinglePinyinVowel} from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `pinyin-tone/workaround` | `markTones`（覆盖它全部 36 个输入） |
| `toPinyinTones(x)` / `toPinyinTonesInline(x)` | `markTones(x)`——改名并合并 |
| `convertUnspacedPinyin(x)` | `markTones(x).replace(/ /g, '')` |
| `toPinyinTonesVariants(x)` | 每 token 写一个冒号 |
| `pinyin-tone/v1`、`splitUnspacedSyllables(x)` | 已删除 |

2.4.1 的根入口有三个名字：默认导出，加上具名的 `v2` 和 `markSinglePinyinVowel`，现在全部并入 `markTones`。漏改哪个名字会当场报错，不会悄悄失效：3.0 没有默认导出，所以 `import anything from 'pinyin-tone'` 是语法错误，不会拖到线上才变成 `undefined`。

## 细节文档

边界情况放在同目录的几份文档里（这份中文 README 也在这里），README 只保留大多数调用会用到的部分。

- [`edge-cases.zh.md`](edge-cases.zh.md) — 数字、`_`、空格，以及切不开的片段
- [`case.zh.md`](case.zh.md) — 大小写，以及 `CO2` 为什么会变成 `CÓ`
- [`uu.zh.md`](uu.zh.md) — `ü`、冒号的合法位置、`ê`，以及没有元音的叹词
- [`strict.zh.md`](strict.zh.md) — `strict` 会放行什么，被它挡下的 1076 个键是什么
- [`skip.zh.md`](skip.zh.md) — `skip` 的完整规则，以及为什么不收正则

每页都有英文版（去掉文件名里的 `.zh` 即可），`docs/` 整个目录都不随 npm 包发布。

## 贡献者

![Contributors](https://mrchenguozheng.github.io/pinyin-tone/CONTRIBUTORS.svg "Contributors")

## 参与开发

问题与建议请[提 issue](https://github.com/mrchenguozheng/pinyin-tone/issues)。

`npm test` 会跑 mocha 和 `tsc --noEmit`；`npm run pack:check` 检查打出来的包里正好只有 `lib/` 和 `dist/`。`dist/index.cjs` 由 `npm run build:cjs` 从 `lib/` 生成，不要手改；改过 `lib/` 之后要跑一次这个脚本，把产物和改动一起提交（提交的产物一旦过期，`npm test` 就会报错）。

## 更新日志

[CHANGELOG.md](https://github.com/mrchenguozheng/pinyin-tone/blob/master/CHANGELOG.md) 放在仓库里，不随 npm 包发布。

## 许可

MIT

## 关于汉语拼音方案

官方文档：[汉语拼音方案.pdf]，见 <http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html>

[汉语拼音方案.pdf]: http://www.moe.gov.cn/ewebeditor/uploadfile/2015/03/02/20150302165814246.pdf
