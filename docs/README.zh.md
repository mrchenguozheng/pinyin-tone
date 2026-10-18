# pinyin-tone

把 `hao3` 这种数字声调写法转成带调号的 `hǎo`。只有一个函数，没有依赖；连写的、夹着汉字的文本，直接传进来就行。

English: [../README.md](../README.md) —— 发布到 npm 和仓库首页的是英文版

[![NPM](https://nodei.co/npm/pinyin-tone.png)](https://nodei.co/npm/pinyin-tone/)

## 安装

```bash
npm install pinyin-tone@next
```

要 Node.js 14 以上（见 `engines`）。ESM 和 CommonJS 都能用，两种写法都得按名字取 `markTones`，**没有默认导出**。`require()` 加载的是 `dist/index.cjs`，这个文件在发布前由 `lib/` 生成，并且逐条和 `lib/` 比对过，跑的不是另一份代码。

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
| `strict` | `boolean` | `false` | 只转普通话的 426 个音节，以及由这些音节决定的儿化写法和字面 `jv` 写法 |
| `skip` | `string \| readonly string[]` | 无 | 内容与列表完全一致（区分大小写）的片段保持原样 |

两个选项都可以不写。不写的时候，能识别的片段全都会转。不认识的字段、不是布尔的 `strict`、既不是字符串也不是数组的 `skip`，一律当作没传——选项不该在你没打算的时候把结果改掉。

名字说的是这次调用**干了什么**，不是这个包是什么：它给已经用 ASCII 写好的拼音（`hao3`、`jv`、`e^`）**加**上调号。汉字转拼音不是它的事，没写出来的声调它也不猜：`ma` 进去，`ma` 出来。

## 一段文本是怎么读的

先把整段文本扫一遍，扫出由「字母、`:`、`^`、`0`–`5`」组成的片段。片段之外的内容——汉字、标点、空白——原样复制过去。每个片段再按声调数字切成音节。一个片段里只要有一处识别不出来，这段就整个原样返回，不会只转半截。

```javascript
markTones('ni3hao3');         // 'nǐhǎo'    数字就是切点
markTones('ni3,hao3');        // 'nǐ,hǎo'   标点留着，两边都转
markTones('hanyu3pin1yin1');  // 原样        没有数字，切不开
markTones('今天ni3hao3');      // '今天nǐhǎo' 汉字不算在片段里
markTones('ni3_hao3');        // 原样        下划线让它成了标识符
```

空格不会增加、删除，也不会合并。实际要记住的只有三条：

- **切不开的片段不猜。** `hanyu3pin1yin1` 里 `hanyu` 中间没有数字，整个片段原样返回。
- **数字不能省，只有末尾那个音节可以不写。** `ni3hao3ma` 给 `nǐhǎoma`；`ni3haoma5` 原样返回。
- **要连成一串，在调用处拼。** 用 `markTones(x).replace(/ /g, '')`；或者在没有数字的音节后面补一个 `0` 来断开，这样输出里不会多出空格：`han0yu3pin1yin1` → `hanyǔpīnyīn`。

## `ü` 的两种拼写

`j`/`q`/`x`/`y` 后面的 `ü` 有两种输入写法：规范写法（`ju`）和字面写法（`jv`），输出一律是规范写法。`n`/`l` 后面就得分开：`nv3` 是 `nǚ`，`nu3` 是 `nǔ`。

冒号就是 `ü` 上面那两点，`ju:1` 得到 `jǖ`。冒号只有两个位置算数：紧跟在它所属的 `u`/`v` 后面，或者放在音节末尾。写在别处，音节原样返回。

```javascript
markTones('jv1');          // 'jū'        字面写法输入，规范写法输出
markTones('jv1 ju1 ju:1'); // 'jū jū jǖ'  两种写法可以混着写
markTones('lu:e4');        // 'lüè'       冒号后面的字母仍属于同一个韵母
```

## 中英混排

汉字不算在片段里，所以贴着汉字的拼音就地转换，不用预处理，也不用换一个函数。

```javascript
markTones('ju是规范写法，而ju:1是不规范写法');
// -> 'ju是规范写法，而jǖ是不规范写法'
```

粘在英文单词上的 `abcju1`/`ju1abc` 不转换；光一个 `ju`、后面没跟声调数字，也不转换。

## 两个容易踩的坑

**全大写的拉丁串会被当成拼音。** `m`、`a`、`o` 本身就是音节，所以 `M2`、`A4`、`O2` 在这个库里都会被当成拼音：`M2` 变成 `Ḿ`，`CO2` 变成 `CÓ`。把这些代码写进 `skip` 即可，输入里不用加任何标记字符：

```javascript
markTones('M2 货币供应量 hao3', {skip: 'M2'});  // 'M2 货币供应量 hǎo'
markTones('M2 A4 N3', {skip: ['M2', 'A4']});    // 'M2 A4 Ň'
```

`skip` 比的是整个片段，而且区分大小写：`'M2'` 碰不到 `M20`（那是另一个片段），也碰不到 `m2`（那是另一个字符串）。

**一条规则管住这个片段的每一次出现。** `M2 M2` 得到 `M2 M2`，不会「留一个、转另一个」。一次调用里既要转又要留，就把文本切开，分别调。

## 从 2.x 迁移

3.0 的根入口就是 2.x 里 `pinyin-tone/v2` 那份实现，并且把两个入口并成了一个：以前贴着汉字写的拼音得改用 `Inline` 版本，现在不用了。把词表每个键的七种声调写法都拼一遍，得到 13664 个输入，逐条对比，两边有 11.3% 的结果不一样——差异都是 3.0 修掉了旧实现丢字母的毛病（`biou1`：2.x 给 `biū`，3.0 给 `biōu`）。要旧输出，请锁 `pinyin-tone@2.4.1`。

| 2.x | 3.0 |
| --- | --- |
| `pinyin-tone/v2`（别名） | 根入口 |
| `import {v2} from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import toPinyinTones from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import {markSinglePinyinVowel} from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `pinyin-tone/workaround` | `markTones`（它那 36 个输入全部覆盖） |
| `toPinyinTones(x)` / `toPinyinTonesInline(x)` | `markTones(x)`——改名并合并 |
| `convertUnspacedPinyin(x)` | `markTones(x).replace(/ /g, '')` |
| `toPinyinTonesVariants(x)` | 每个需要冒号的 token 写一个冒号 |
| `pinyin-tone/v1`、`splitUnspacedSyllables(x)` | 已删除 |

2.4.1 的根入口有三个名字：默认导出，加上具名的 `v2` 和 `markSinglePinyinVowel`，现在全部并进了 `markTones`。名字漏改会当场报错，不会拖到线上：3.0 没有默认导出，`import anything from 'pinyin-tone'` 是语法错误，不会变成 `undefined` 混过去。

3.0 发布时走的是 `next` 标签，`latest` 还指着 2.4.1，所以手上有 `^2` 的项目不会在 `npm install` 之后突然跳过去。要升级，写 `npm install pinyin-tone@next`；跳过去之后想退回，把版本改回 `2.4.1` 或 `^2` 就行。

## 细节文档

README 只写大多数调用会用到的部分；边界情况在 `docs/` 的另外几页（这份中文 README 也放在这里）。

- [`edge-cases.zh.md`](edge-cases.zh.md) — 数字、`_`、空格，以及切不开的片段
- [`case.zh.md`](case.zh.md) — 大小写，以及 `CO2` 为什么变成 `CÓ`
- [`uu.zh.md`](uu.zh.md) — `ü`、冒号的合法位置、`ê`、没有元音的叹词
- [`strict.zh.md`](strict.zh.md) — `strict` 放行什么，挡下的 1076 个键又是什么
- [`skip.zh.md`](skip.zh.md) — `skip` 的全部规则，以及为什么不收正则

每页都有英文版（文件名去掉 `.zh` 就是）。`docs/` 整个目录不随 npm 包发布。

## 贡献者

![Contributors](https://mrchenguozheng.github.io/pinyin-tone/CONTRIBUTORS.svg "Contributors")

## 参与开发

有问题或建议请[提 issue](https://github.com/mrchenguozheng/pinyin-tone/issues)。

`npm test` 跑 mocha 和 `tsc --noEmit`；`npm run pack:check` 检查打出来的包里正好只有 `lib/` 和 `dist/`。`dist/index.cjs` 由 `npm run build:cjs` 从 `lib/` 生成，不要手改；改过 `lib/` 之后要跑一次这个脚本，把产物和改动一起提交——提交的产物一旦过期，`npm test` 就会报错。

## 更新日志

[CHANGELOG.md](https://github.com/mrchenguozheng/pinyin-tone/blob/master/CHANGELOG.md) 放在仓库里，不随 npm 包发布。

## 许可

MIT

## 关于汉语拼音方案

官方文档：[汉语拼音方案.pdf]，见 <http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/195802/t19580201_186000.html>

[汉语拼音方案.pdf]: http://www.moe.gov.cn/ewebeditor/uploadfile/2015/03/02/20150302165814246.pdf
