// 验证 package.json 的 exports 映射与各入口的类型声明是否真的可用。
// 这里用的是「包自引用」（self-reference）：import 的说明符是包名，
// 所以必须靠 exports 字段才能解析成功。
import v2Default, { splitUnspacedSyllables, convertUnspacedPinyin, toPinyinTonesVariants, toPinyinTonesInline } from 'pinyin-tone/v2';
import type { PinyinTonesVariants, PinyinTonesOptions } from 'pinyin-tone/v2';
import v2DefaultFromFile from 'pinyin-tone/v2/index.js';
import v1Default from 'pinyin-tone/v1';
import v1DefaultFromFile from 'pinyin-tone/v1/index.js';
import markSinglePinyinVowel from 'pinyin-tone/workaround';
import markSinglePinyinVowelFromFile from 'pinyin-tone/workaround/index.js';

const a: string = v2Default('ni3 hao3');
const b: string = splitUnspacedSyllables('han4yu3pin1yin1');
const c: string = convertUnspacedPinyin('han4yu3pin1yin1');
const d: string = v2DefaultFromFile('ni3 hao3');
const e: string = v1Default('ma1 ma2 ma3 ma4 ma');
const f: string = v1DefaultFromFile('ma1 ma2 ma3 ma4 ma');
const g: string = markSinglePinyinVowel('a');
const h: string = markSinglePinyinVowelFromFile('a');

// 冒号标记与裸写都是普通字符串输入，没有额外类型
const i: string = v2Default('ju1 ju:1');
const j: string = convertUnspacedPinyin('ju:1nv3');

// 混排：只有一个参数
const inlineDefault: string = toPinyinTonesInline('ju是规范写法，而ju:1不是');

// 第二参数是可选的 options，只认 strict
const strictOn: string = v2Default('jui1', {strict: true});
const strictEmpty: string = convertUnspacedPinyin('ju1', {});
const strictInline: string = toPinyinTonesInline('jui1', {strict: false});
const options: PinyinTonesOptions = {strict: true};
const strictTyped: string = toPinyinTonesVariants('jui1', options).canonical;

// @ts-expect-error options 只有 strict 一个字段
v2Default('jv1', {literal: true});
// @ts-expect-error strict 必须是 boolean
convertUnspacedPinyin('ju1', {strict: 'yes'});
// @ts-expect-error 第二参数必须是对象
toPinyinTonesInline('jv1', true);

// variants：返回结构必须有 canonical / literal 两个 string 字段
const variants: PinyinTonesVariants = toPinyinTonesVariants('jv1');
const vCanonical: string = variants.canonical;
const vLiteral: string = variants.literal;

export { a, b, c, d, e, f, g, h, i, j, variants, vCanonical, vLiteral, inlineDefault,
    strictOn, strictEmpty, strictInline, strictTyped };
