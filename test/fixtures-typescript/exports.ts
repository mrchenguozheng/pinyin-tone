// 验证 package.json 的 exports 映射与入口的类型声明是否真的可用。
// 这里用的是「包自引用」（self-reference）：import 的说明符是包名，
// 所以必须靠 exports 字段才能解析成功。
import toToneMarks, { toToneMarksInText } from 'pinyin-tone';
import type { ToneMarksOptions } from 'pinyin-tone';

const a: string = toToneMarks('ni3 hao3');

// 冒号标记与裸写都是普通字符串输入，没有额外类型
const i: string = toToneMarks('ju1 ju:1');

// 混排：只有一个参数
const inlineDefault: string = toToneMarksInText('ju是规范写法，而ju:1不是');

// 第二参数是可选的 options，只认 strict
const strictOn: string = toToneMarks('jui1', {strict: true});
const options: ToneMarksOptions = {strict: true};
const strictTyped: string = toToneMarks('jui1', options);
const strictInline: string = toToneMarksInText('jui1', {strict: false});

// @ts-expect-error options 只有 strict 一个字段
toToneMarks('jv1', {literal: true});
// @ts-expect-error strict 必须是 boolean
toToneMarks('ju1', {strict: 'yes'});
// @ts-expect-error 第二参数必须是对象
toToneMarksInText('jv1', true);

// 3.0 删掉的历史子路径必须解析失败 —— 失败才说明破坏性变更真的生效了。
// @ts-expect-error pinyin-tone/v1 在 3.0 已删除（v1 实现不再随包发布）
import v1Default from 'pinyin-tone/v1';
// @ts-expect-error pinyin-tone/v2 在 3.0 已删除（目录改名为 lib/，且不再作为公开入口）
import v2Default from 'pinyin-tone/v2';
// @ts-expect-error pinyin-tone/workaround 在 3.0 已删除（单字母查表被 toToneMarks 覆盖）
import markSinglePinyinVowel from 'pinyin-tone/workaround';
// @ts-expect-error 带文件名的旧写法同样不再解析
import markSinglePinyinVowelFromFile from 'pinyin-tone/workaround/index.js';

// 3.0 收敛掉的函数必须不再是导出：公开面只剩 toToneMarks 与 toToneMarksInText。
// @ts-expect-error convertUnspacedPinyin 在 3.0 已删除（连写输入转换器本来就接受）
import { convertUnspacedPinyin } from 'pinyin-tone';
// @ts-expect-error toPinyinTonesVariants 在 3.0 已删除（字面拼写只由冒号逐 token 请求）
import { toPinyinTonesVariants } from 'pinyin-tone';
// @ts-expect-error splitUnspacedSyllables 在 3.0 不再是导出
import { splitUnspacedSyllables } from 'pinyin-tone';

// 3.0 改掉的旧名字不得复活：类型层面也断掉，避免同义的两个入口并存。
// @ts-expect-error toPinyinTones 已改名为 toToneMarks
import { toPinyinTones } from 'pinyin-tone';
// @ts-expect-error toPinyinTonesInline 已改名为 toToneMarksInText
import { toPinyinTonesInline } from 'pinyin-tone';
// @ts-expect-error PinyinTonesOptions 已改名为 ToneMarksOptions
import type { PinyinTonesOptions } from 'pinyin-tone';

export { a, i, inlineDefault, strictOn, strictTyped, strictInline };
