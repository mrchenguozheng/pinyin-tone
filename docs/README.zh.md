# pinyin-tone

把 `hao3` 这类数字声调转成带调号的拼音 `hǎo`。一个函数，无依赖；连写与中英混排都能直接喂进去。

English: [../README.md](../README.md) —— 英文版是 npm 包与首页的默认版本

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

## 安装

```bash
npm install pinyin-tone
```

需要 Node.js 14 或更高版本（`engines`）。ESM 与 CommonJS 都能用，两边都要具名取 `markTones`（**没有默认导出**）。`require()` 走的是 `dist/index.cjs`，它由 `lib/` 在发布前生成并被逐条对拍——是同一份代码，不是第二份实现。

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
| `strict` | `boolean` | `false` | 只转普通话的 426 个音节，外加由它们决定的儿化与字面 `jv` 写法 |
| `skip` | `string \| readonly string[]` | 无 | 与声明一字不差（区分大小写）的片段保持原样 |

两个选项都可省略；不写时凡是认得出来的片段都转换。其余写法一律当没传——未知字段、非布尔的 `strict`、不是字符串或数组的 `skip`——因为选项不该意外改变算法。

名字说的是这个调用**做什么**，不是这个包是什么：它给你已经用 ASCII 写好的拼音（`hao3`、`jv`、`e^`）**标上**调号。它不把汉字转成拼音，也不猜一个没写出来的声调：`ma` 仍是 `ma`。

## 一段文本是怎么读的

整段扫描由「字母 / `:` / `^` / `0`–`5`」组成的片段；片段之外的一切——汉字、标点、空白——逐字照抄。片段内部按声调数字切成音节；一个片段认不全就整段原样返回，绝不输出半截。

```javascript
markTones('ni3hao3');         // 'nǐhǎo'    数字就是切点
markTones('ni3,hao3');        // 'nǐ,hǎo'   标点留着，两边都转
markTones('hanyu3pin1yin1');  // 原样        没有数字可以切
markTones('今天ni3hao3');      // '今天nǐhǎo' 汉字不属于任何片段
markTones('ni3_hao3');        // 原样        下划线让它读作标识符
```

空格不增、不删、不合并。实际使用只有三件要紧的：

- **没有切点的片段不猜。** `hanyu3pin1yin1` 的 `hanyu` 里没有数字，整串原样返回。
- **数字不能省，只有片段最后一段可以省。** `ni3hao3ma` → `nǐhǎoma`，而 `ni3haoma5` 原样。
- **要粘连就在调用方做。** `markTones(x).replace(/ /g, '')`；或者在无声调的音节后补 `0` 分隔而不产生空格：`han0yu3pin1yin1` → `hanyǔpīnyīn`。

## `ü` 的两种拼写

`j`/`q`/`x`/`y` 之后的 `ü` 有规范（`ju`）与字面（`jv`）两种输入，输出一律规范形式。`n`/`l` 保持对立：`nv3` 是 `nǚ`，`nu3` 是 `nǔ`。

冒号就是那两点：`ju:1` 得到 `jǖ`。它只能紧跟在所属的 `u`/`v` 后面，或缀在整个音节末尾；写在别处整串原样返回。

```javascript
markTones('jv1');          // 'jū'        字面输入，规范输出
markTones('jv1 ju1 ju:1'); // 'jū jū jǖ'  两种写法可以写在同一行
markTones('lu:e4');        // 'lüè'       冒号后面仍属同一个韵母
```

## 中英混排

汉字不属于任何片段，紧贴着的拼音就地转换——不需要预处理，也不需要另一个入口。

```javascript
markTones('ju是规范写法，而ju:1是不规范写法');
// -> 'ju是规范写法，而jǖ是不规范写法'
```

粘在英文单词上的 `abcju1`/`ju1abc` 不动，没有声调数字的 `ju` 也不动。

## 两个容易踩的坑

**全大写拉丁串会和拼音撞车。** `M2`、`A4`、`O2` 在这个库里看起来就是拼音，因为 `m`、`a`、`o` 本身就是音节：`M2` 会变成 `Ḿ`，`CO2` 会变成 `CÓ`。把这些码列进 `skip` 即可，输入里不用写任何标记字符：

```javascript
markTones('M2 货币供应量 hao3', {skip: 'M2'});  // 'M2 货币供应量 hǎo'
markTones('M2 A4 N3', {skip: ['M2', 'A4']});    // 'M2 A4 Ň'
```

`skip` 比的是整个片段、区分大小写：`'M2'` 碰不到 `M20`（另一个片段），也碰不到 `m2`（另一个字符串）。

**规则以片段为单位。** 一条规则覆盖该片段的每一次出现：`M2 M2` 得到 `M2 M2`，不会「保一个转一个」。一次调用里要两种结果，就把文本切开分别调用。

## 从 2.x 迁移

3.0 的根入口就是 2.x 里 `pinyin-tone/v2` 那份实现，并把两个入口并成一个：紧贴汉字的拼音以前要换 `Inline` 版本，现在不需要了。把每个词表键 × 七种声调写法拼成的 13664 个输入逐条对比，两者有 11.3% 不同——3.0 修的是旧实现丢字母的情况（`biou1`：2.x 给 `biū`，3.0 给 `biōu`）。需要旧输出请锁 `pinyin-tone@2.4.1`。

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

2.4.1 的根入口有三个名字——默认导出，加上具名导出 `v2` 与 `markSinglePinyinVowel`——全部并到 `markTones`。改漏了会当场报错而不是静默失效：3.0 没有默认导出，`import anything from 'pinyin-tone'` 是语法错误，不会留到线上才变成 `undefined`。

## 细节文档

边界情况都放在同目录的几份文档里（这份中文版本身也在这里），README 只留多数调用需要知道的部分。

- [`edge-cases.zh.md`](edge-cases.zh.md) — 数字、`_`、空格、切不动的片段
- [`case.zh.md`](case.zh.md) — 大小写，以及 `CO2` 为什么会变成 `CÓ`
- [`uu.zh.md`](uu.zh.md) — `ü`、冒号的合法位置、`ê`、没有元音的叹词
- [`strict.zh.md`](strict.zh.md) — `strict` 放行什么，挡掉的 1076 个是什么
- [`skip.zh.md`](skip.zh.md) — `skip` 的完整语义，以及为什么不收正则

每页都有英文版（把文件名里的 `.zh` 去掉），`docs/` 整体不随 npm 包发布。

## 贡献者

![Contributors](https://mrchenguozheng.github.io/pinyin-tone/CONTRIBUTORS.svg "Contributors")

## 参与开发

问题与建议请[提 issue](https://github.com/mrchenguozheng/pinyin-tone/issues)。

`npm test` 跑 mocha 与 `tsc --noEmit`；`npm run pack:check` 校验打出来的包里正好只有 `lib/` 与 `dist/`。`dist/index.cjs` 由 `npm run build:cjs` 从 `lib/` 生成，不要手改；改了 `lib/` 之后要跑一次这个脚本并把产物一起提交（提交的副本一旦过期，`npm test` 会报错）。

## 更新日志

[CHANGELOG.md](https://github.com/mrchenguozheng/pinyin-tone/blob/master/CHANGELOG.md) 在仓库里，不随 npm 包发布。

## 许可

MIT

## 关于汉语拼音方案

官方文档：[汉语拼音方案.pdf]，见 <http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html>

[汉语拼音方案.pdf]: http://www.moe.gov.cn/ewebeditor/uploadfile/2015/03/02/20150302165814246.pdf
