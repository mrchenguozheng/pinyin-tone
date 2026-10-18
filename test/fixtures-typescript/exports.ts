// 验证 package.json 的 exports 映射与各入口的类型声明是否真的可用。
// 这里用的是「包自引用」（self-reference）：import 的说明符是包名，
// 所以必须靠 exports 字段才能解析成功。
import v2Default, { splitUnspacedSyllables, convertUnspacedPinyin, toPinyinTonesVariants, toPinyinTonesInline } from 'pinyin-tone/v2';
import type { UmlautStyle, ToPinyinTonesOptions, PinyinTonesVariants } from 'pinyin-tone/v2';
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

// umlaut 选项：四种取值都必须是合法类型，且能传到三个函数上
const style: UmlautStyle = 'keep';
const asWritten: UmlautStyle = 'as-written';
const opts: ToPinyinTonesOptions = { umlaut: 'omit' };
const i: string = v2Default('jv1', { umlaut: style });
const j: string = convertUnspacedPinyin('ju1', opts);
const k: string = convertUnspacedPinyin('ju1', { umlaut: 'auto' });

// 混排：默认 as-written，也可显式指定风格
const inlineDefault: string = toPinyinTonesInline('ju是规范写法，而jv1不是');
const inlineExplicit: string = toPinyinTonesInline('jv1', { umlaut: asWritten });

// 'canonical' 不是合法取值 —— 若哪天 d.ts 放宽成 string，这行会因「不该有错」而报错
// @ts-expect-error 非法 umlaut 取值必须在编译期被拒
v2Default('jv1', { umlaut: 'canonical' });

// variants：返回结构必须有 canonical / literal 两个 string 字段
const variants: PinyinTonesVariants = toPinyinTonesVariants('jv1');
const vCanonical: string = variants.canonical;
const vLiteral: string = variants.literal;

export { a, b, c, d, e, f, g, h, i, j, k, variants, vCanonical, vLiteral, inlineDefault, inlineExplicit };
