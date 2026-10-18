// 验证 package.json 的 exports 映射与入口的类型声明是否真的可用。
// 这里用的是「包自引用」（self-reference）：import 的说明符是包名，
// 所以必须靠 exports 字段才能解析成功。
import {markTones} from 'pinyin-tone';
import type { MarkTonesOptions, SkipSpec } from 'pinyin-tone';

const a: string = markTones('ni3 hao3');

// 冒号标记与裸写都是普通字符串输入，没有额外类型
const i: string = markTones('ju1 ju:1');

// 混排文本走同一个入口，不需要换函数
const mixed: string = markTones('ju是规范写法，而ju:1不是');

// 第二参数是可选的 options，只认 strict 与 skip
const strictOn: string = markTones('jui1', {strict: true});
const options: MarkTonesOptions = {strict: true};
const strictTyped: string = markTones('jui1', options);
const strictMixed: string = markTones('你好 jui1', {strict: false});

// skip 的两种写法都要能通过类型检查
const skipOne: string = markTones('M2 hao3', {skip: 'M2'});
const skipMany: string = markTones('M2 A4', {skip: ['M2', 'A4']});
const skipSpec: SkipSpec = ['M2', 'A4'];
const skipTyped: string = markTones('M2 hao3', {skip: skipSpec});
const bothOptions: string = markTones('jui1 M2', {strict: true, skip: 'M2'});

// @ts-expect-error options 只有 strict 与 skip 两个字段
markTones('jv1', {literal: true});
// @ts-expect-error strict 必须是 boolean
markTones('ju1', {strict: 'yes'});
// @ts-expect-error skip 不收 boolean
markTones('M2', {skip: true});
// @ts-expect-error skip 不收 RegExp（只看得到单个片段，环视会静默失效）
markTones('M2', {skip: /^M2$/});
// @ts-expect-error skip 不收函数：只认片段文本相等这一条语义
markTones('M2', {skip: (run: string) => run === 'M2'});
// @ts-expect-error skip 的数组只能放字符串
markTones('M2', {skip: ['M2', 42]});
// @ts-expect-error 第二参数必须是对象
markTones('jv1', true);

// 3.0 删掉的历史子路径必须解析失败 —— 失败才说明破坏性变更真的生效了。
// @ts-expect-error pinyin-tone/v1 在 3.0 已删除（v1 实现不再随包发布）
import v1Default from 'pinyin-tone/v1';
// @ts-expect-error pinyin-tone/v2 在 3.0 已删除（目录改名为 lib/，且不再作为公开入口）
import v2Default from 'pinyin-tone/v2';
// @ts-expect-error pinyin-tone/workaround 在 3.0 已删除（单字母查表被 markTones 覆盖）
import markSinglePinyinVowel from 'pinyin-tone/workaround';
// @ts-expect-error 带文件名的旧写法同样不再解析
import markSinglePinyinVowelFromFile from 'pinyin-tone/workaround/index.js';

// 3.0 收敛掉的函数必须不再是导出：公开面只剩具名导出的 markTones。
// @ts-expect-error convertUnspacedPinyin 在 3.0 已删除（连写输入转换器本来就接受）
import { convertUnspacedPinyin } from 'pinyin-tone';
// @ts-expect-error toPinyinTonesVariants 在 3.0 已删除（字面拼写只由冒号逐 token 请求）
import { toPinyinTonesVariants } from 'pinyin-tone';
// @ts-expect-error splitUnspacedSyllables 在 3.0 不再是导出
import { splitUnspacedSyllables } from 'pinyin-tone';

// 3.0 改掉的旧名字不得复活：类型层面也断掉，避免同义入口并存。
// @ts-expect-error toPinyinTones 已改名为 markTones
import { toPinyinTones } from 'pinyin-tone';
// @ts-expect-error toPinyinTonesInline 已删除（混排与按空格切已经合并成一个入口）
import { toPinyinTonesInline } from 'pinyin-tone';
// @ts-expect-error PinyinTonesOptions 已改名为 MarkTonesOptions
import type { PinyinTonesOptions } from 'pinyin-tone';

// 3.0 定稿中途用过的名字（从未发布）也不留别名：
// 一旦它们还能解析，就说明有分支被错误地合了回来。
// @ts-expect-error toToneMarks 是 3.0 的中间名，定稿为 markTones
import { toToneMarks } from 'pinyin-tone';
// @ts-expect-error ToneMarksOptions 是 3.0 的中间名，定稿为 MarkTonesOptions
import type { ToneMarksOptions } from 'pinyin-tone';
// @ts-expect-error SkipContext 随 skip 的函数写法一起删掉了（skip 只收字符串）
import type { SkipContext } from 'pinyin-tone';

// 两个入口已经合并：这个曾经存在过的名字不得以任何形式复活。
// @ts-expect-error markTonesInText 已合并进 markTones
import { markTonesInText } from 'pinyin-tone';
// @ts-expect-error toToneMarksInText 是合并前的中间名，同样不存在
import { toToneMarksInText } from 'pinyin-tone';

// 公开面只有一个具名导出：默认导入必须解析失败，否则同一个函数就有了两种取法。
// @ts-expect-error 3.0 起没有默认导出，取 markTones 得用具名导入
import defaultExport from 'pinyin-tone';

export { a, i, mixed, strictOn, strictTyped, strictMixed, skipOne, skipMany, skipTyped, bothOptions };
