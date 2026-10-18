// 验证 package.json 的 exports 映射与各入口的类型声明是否真的可用。
// 这里用的是「包自引用」（self-reference）：import 的说明符是包名，
// 所以必须靠 exports 字段才能解析成功。
import toPinyinTones, { convertUnspacedPinyin, toPinyinTonesVariants, toPinyinTonesInline } from 'pinyin-tone';
import type { PinyinTonesVariants, PinyinTonesOptions } from 'pinyin-tone';
import markSinglePinyinVowel from 'pinyin-tone/workaround';
import markSinglePinyinVowelFromFile from 'pinyin-tone/workaround/index.js';

const a: string = toPinyinTones('ni3 hao3');
const c: string = convertUnspacedPinyin('han4yu3pin1yin1');
const g: string = markSinglePinyinVowel('a');
const h: string = markSinglePinyinVowelFromFile('a');

// 冒号标记与裸写都是普通字符串输入，没有额外类型
const i: string = toPinyinTones('ju1 ju:1');
const j: string = convertUnspacedPinyin('ju:1nv3');

// 混排：只有一个参数
const inlineDefault: string = toPinyinTonesInline('ju是规范写法，而ju:1不是');

// 第二参数是可选的 options，只认 strict
const strictOn: string = toPinyinTones('jui1', {strict: true});
const strictEmpty: string = convertUnspacedPinyin('ju1', {});
const strictInline: string = toPinyinTonesInline('jui1', {strict: false});
const options: PinyinTonesOptions = {strict: true};
const strictTyped: string = toPinyinTonesVariants('jui1', options).canonical;

// @ts-expect-error options 只有 strict 一个字段
toPinyinTones('jv1', {literal: true});
// @ts-expect-error strict 必须是 boolean
convertUnspacedPinyin('ju1', {strict: 'yes'});
// @ts-expect-error 第二参数必须是对象
toPinyinTonesInline('jv1', true);

// variants：返回结构必须有 canonical / literal 两个 string 字段
const variants: PinyinTonesVariants = toPinyinTonesVariants('jv1');
const vCanonical: string = variants.canonical;
const vLiteral: string = variants.literal;

// 3.0 删掉的历史子路径必须解析失败 —— 失败才说明破坏性变更真的生效了。
// @ts-expect-error pinyin-tone/v1 在 3.0 已删除（v1 实现不再随包发布）
import v1Default from 'pinyin-tone/v1';
// @ts-expect-error pinyin-tone/v2 在 3.0 已删除（目录改名为 lib/，且不再作为公开入口）
import v2Default from 'pinyin-tone/v2';

// splitUnspacedSyllables 在 3.0 不再是导出，这一行必须解析失败。
// @ts-expect-error splitUnspacedSyllables 在 3.0 不再是导出
import { splitUnspacedSyllables } from 'pinyin-tone';

export { a, c, g, h, i, j, variants, vCanonical, vLiteral,
    inlineDefault, strictOn, strictEmpty, strictInline, strictTyped };
