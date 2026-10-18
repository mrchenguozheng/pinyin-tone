// 验证 package.json 的 exports 映射与各入口的类型声明是否真的可用。
// 这里用的是「包自引用」（self-reference）：import 的说明符是包名，
// 所以必须靠 exports 字段才能解析成功。
import v2Default, { splitUnspacedSyllables, convertUnspacedPinyin } from 'pinyin-tone/v2';
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

export { a, b, c, d, e, f, g, h };
