// 验证 package.json 的 exports 映射与各入口的类型声明是否真的可用。
// 这里用的是「包自引用」（self-reference）：import 的说明符是包名，
// 所以必须靠 exports 字段才能解析成功。
import v2Default, { splitUnspacedSyllables, convertUnspacedPinyin, toPinyinTonesVariants, toPinyinTonesInline } from 'pinyin-tone/v2';
import type { PinyinTonesVariants } from 'pinyin-tone/v2';
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

// 三个函数都只有一个参数：多传的参数必须在编译期被拒
// @ts-expect-error 不接受第二参数
v2Default('jv1', {});
// @ts-expect-error 不接受第二参数
convertUnspacedPinyin('ju1', {});
// @ts-expect-error 不接受第二参数
toPinyinTonesInline('jv1', {});

// variants：返回结构必须有 canonical / literal 两个 string 字段
const variants: PinyinTonesVariants = toPinyinTonesVariants('jv1');
const vCanonical: string = variants.canonical;
const vLiteral: string = variants.literal;

export { a, b, c, d, e, f, g, h, i, j, variants, vCanonical, vLiteral, inlineDefault };
