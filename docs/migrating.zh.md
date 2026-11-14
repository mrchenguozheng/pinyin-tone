# 从 2.x 升到 3.0

现在 `npm install pinyin-tone` 装到的就是 3.0。写着 `^2` 的项目不会自己动——`^2` 匹配不到 `3.x`——所以升级发生在你改 `package.json` 的时候，不是 `npm install` 的时候。

这一页放 README 装不下的东西：那些被删掉的名字现在各报什么错、哪些输出变了、升级之前怎么先拿自己的输入验一遍。

English: [migrating.md](migrating.md)

## 逐个入口对过去

| 2.x | 3.0 |
| --- | --- |
| `import toPinyinTones from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import {v2} from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import {markSinglePinyinVowel} from 'pinyin-tone'` | `import {markTones} from 'pinyin-tone'` |
| `import x from 'pinyin-tone/v2'` | `import {markTones} from 'pinyin-tone'` |
| `import {markSinglePinyinVowel} from 'pinyin-tone/workaround'` | `import {markTones} from 'pinyin-tone'` |
| `toPinyinTonesInline(text)` | `markTones(text)` |
| `convertUnspacedPinyin(text)` | `markTones(text).replace(/ /g, '')` |
| `splitUnspacedSyllables(text)` | 不用替代——连写输入本来就照收 |
| `toPinyinTonesVariants(text)` | 一次只要一种写法：`markTones('ju1 ju:1')` 给 `'jū jǖ'` |
| `pinyin-tone/v1` | 没有替代，锁 `pinyin-tone@2.5.2` |

CommonJS 那边也是改名，区别只在拿到的形状：`require('pinyin-tone')` 返回 `{markTones}`，不是函数，解构不能省：

```javascript
const {markTones} = require('pinyin-tone');
```

## 两条替代写法不完全等价

`convertUnspacedPinyin` 认得多少转多少，剩下的原样留着：`hanyu3pin1yin1` 当年出来是 `hanyu3pīnyīn`。3.0 是全转或全不转，上面那条替代会把它原样还你。以前拿到半截转换的地方，现在拿回的是输入。

`toPinyinTonesVariants` 一次返回整串的 `{canonical, literal}`。3.0 里字面拼写是按 token 用冒号要的，常见的写法一次调用仍然够——`markTones('ju1 ju:1')` 就是 `'jū jǖ'`。整串每个音节都要两种写法，这一种情况才需要多调几次。

## 报错长什么样

这些都不是悄悄失败。改名由模块系统把关，不靠运行时检查，所以已经不存在的名字到不了线上变成 `undefined`。

| 报出来的 | 由什么引起 |
| --- | --- |
| `SyntaxError: The requested module 'pinyin-tone' does not provide an export named 'default'` | `import anything from 'pinyin-tone'` |
| `SyntaxError: The requested module 'pinyin-tone' does not provide an export named 'v2'` | `import {v2} from 'pinyin-tone'` |
| `ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './v2' is not defined by "exports"` | 导入 `/v2`、`/v1` 或 `/workaround` |
| `TypeError: xxx is not a function` | `const fn = require('pinyin-tone'); fn(text)` |
| `error TS2613: Module '…' has no default export` | TypeScript 看到的默认导入 |

## 输出变了哪些

两个对比用同一批 13664 个输入：词表每个键 × 七种声调写法（不带数字，以及 `0`–`5`）。

对 2.5.2 的根入口，1548 个不一样（11.3%）。"旧入口把字母吞了"只解释其中 966 个，其余是它根本没转换的输入（509 个，`e^0` 还是 `e^0`，3.0 给 `ê`），以及等长的 ü 拼写差（73 个，`jvn` 的 `jün` 对 `jun`）：

| 输入 | 2.5.2 根入口 | 3.0 |
| --- | --- | --- |
| `biou1` | `biū` | `biōu` |
| `biou3` | `biǔ` | `biǒu` |

对 `pinyin-tone/v2`，259 个不一样（1.9%），落在 38 个键上，分三组：

| 输入 | 2.5.2 的 `/v2` | 3.0 | 原因 |
| --- | --- | --- | --- |
| `jv1` | `jǖ` | `jū` | j、q、x、y 后面的 ü 写作 u |
| `m1` | `m1` | `m̄` | 不带元音的叹词也标调 |
| `e^1` | `e^1` | `ê̄` | `^` 这种写法 2.x 不认，它从来不是声调数字 |

如果以前靠 `jv1` 出 `jǖ`，字面拼写现在也还拿得到，只是要加冒号：`markTones('ju:1')` 给 `'jǖ'`。

## 升级前先拿自己的输入验一遍

两个版本并排装，旧的那个换个名字：

```bash
npm install pinyin-tone@3 oldpin@npm:pinyin-tone@2.5.2
```

```javascript
// compare.mjs
import oldRoot from 'oldpin';              // 2.5.2 的根入口
import oldV2 from 'oldpin/v2';             // 2.5.2 的 /v2 入口
import {markTones} from 'pinyin-tone';

const inputs = [];                         // 要验的字符串，一条一个元素

for (const text of inputs) {
    const now = markTones(text);
    if (now !== oldRoot(text) || now !== oldV2(text)) {
        console.log(JSON.stringify([text, oldRoot(text), oldV2(text), now]));
    }
}
```

清单短，说明这次升级对你只是改名。清单长，说明你的输出依赖旧行为，回上面两张表看是哪一类。

## 退回

`npm install pinyin-tone@2.5.2`（`legacy` 标签指的就是它），或者把 `package.json` 里的版本写回 `2.5.2`（写 `^2` 也行，3.x 匹配不到它）。挪的只有 `latest` 标签。`2.4.1` 还在 npm 上，但已被标弃用：它的 `/v2` 入口是切片匹配而不是解析（`Hao3` 给 `ao`，`toString` 给 `to`），`2.5.0` 才修掉。

## 清单

- 所有导入都改成 `{markTones}`，没有把 `require()` 的返回值直接当函数调
- 子路径导入清干净了
- `compare.mjs` 打出来的差异清单看过一遍
- `strict` 和 `skip` 是 3.0 新加的，已有的调用不需要它们，两个都默认关闭
