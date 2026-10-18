// 验证 package.json 的 exports 映射与各入口的类型声明是否真的可用。
// 这里用的是「包自引用」（self-reference）：import 的说明符是包名，
// 所以必须靠 exports 字段才能解析成功。
import toPinyinTones, { convertUnspacedPinyin, toPinyinTonesVariants, toPinyinTonesInline } from 'pinyin-tone';
import type { PinyinTonesVariants, PinyinTonesOptions } from 'pinyin-tone';
import v1Default from 'pinyin-tone/v1';
import v1DefaultFromFile from 'pinyin-tone/v1/index.js';
import markSinglePinyinVowel from 'pinyin-tone/workaround';
import markSinglePinyinVowelFromFile from 'pinyin-tone/workaround/index.js';

const a: string = toPinyinTones('ni3 hao3');
const c: string = convertUnspacedPinyin('han4yu3pin1yin1');
const e: string = v1Default('ma1 ma2 ma3 ma4 ma');
const f: string = v1DefaultFromFile('ma1 ma2 ma3 ma4 ma');
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

// v3 起根入口就是 v2 的实现。`pinyin-tone/v2` 保留为别名 —— 2.x 的 README 教过用户
// 这样写，删掉会让那些 import 直接失败，所以这里验证它**能**解析且类型正确。
import v2Default from 'pinyin-tone/v2';
import v2DefaultFromFile from 'pinyin-tone/v2/index.js';

const k: string = v2Default('ni3hao3');
const l: string = v2DefaultFromFile('ni3hao3');

// splitUnspacedSyllables 在 v3 不再是导出，这一行必须解析失败 —— 失败才说明
// 破坏性变更真的生效了。
// @ts-expect-error splitUnspacedSyllables 在 v3 不再是导出
import { splitUnspacedSyllables } from 'pinyin-tone';

export { a, c, e, f, g, h, i, j, k, l, variants, vCanonical, vLiteral, inlineDefault,
    strictOn, strictEmpty, strictInline, strictTyped };
