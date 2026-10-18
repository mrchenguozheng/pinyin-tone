'use strict';
import pinyin_dict_v2 from './dict.js';

// 整串必须完全匹配：纯小写字母 + 一个可选声调数字。
// 不加锚点会静默截断输入（"ni3hao3" -> "nǐ"、"ma6" -> "ma"），
// 大写字母还会被跳过而错位匹配（"Hao3" -> "ǎo"）。
const regex = /^(?<abc>[a-z]+)(?<num>[0-5]?)$/;

// ---------------------------------------------------------------- ü 的两种写法
//
// 同一个音节在「j/q/x/y + ü」上有两种拼写：
//   规范（国标）  ju  jue  juan  jun   ← j/q/x/y 与 ü 相拼时省两点
//   字面（保留）  jv  jve  jvan  jvn   ← 词表里用 v 表示 ü（ASCII 输入约定）
// 二者是同一音位的两种写法，不是两个音节，因此可以互相投影而不丢信息。
//
// 只对 j/q/x/y 成立：这四个声母后的 u 永远不是真正的 u（互补分布）。
// n/l 后的 u 与 ü 是对立音位（nǔ 努 / nǚ 女、lù 路 / lǜ 绿），不能投影。
const UMLAUT_HEADS = 'jqxy';

// 可省的韵母：ü / üe / üan / ün，及其儿化变体。必须穷举成闭集，
// 不能用 /^u/ 之类的前缀匹配 —— 词表里还有 jui/jua/juo/juai/juei/juen/
// juang/jueng 这类笛卡尔积产生的假音节，前缀匹配会把它们误转成 jüí/jüá。
const UMLAUT_FINALS = new Set(['u', 'ue', 'uan', 'un', 'ur', 'uer', 'uanr', 'unr']);

const UMLAUT_STYLES = new Set(['auto', 'keep', 'omit']);

/**
 * 字面写法 -> 规范写法（jv -> ju）。仅在白名单内生效。
 * @param {string} abbr
 * @returns {string}
 */
function toCanonicalSpelling(abbr) {
    if (abbr.length >= 2 && UMLAUT_HEADS.includes(abbr[0]) && abbr[1] === 'v'
        && UMLAUT_FINALS.has('u' + abbr.slice(2))) {
        return abbr[0] + 'u' + abbr.slice(2);
    }
    return abbr;
}

/**
 * 规范写法 -> 字面写法（ju -> jv）。仅在白名单内生效。
 * @param {string} abbr
 * @returns {string}
 */
function toLiteralSpelling(abbr) {
    if (abbr.length >= 2 && UMLAUT_HEADS.includes(abbr[0]) && abbr[1] === 'u'
        && UMLAUT_FINALS.has(abbr.slice(1))) {
        return abbr[0] + 'v' + abbr.slice(2);
    }
    return abbr;
}

/**
 * 按 umlaut 选项决定查表用哪个键。
 *   auto（默认）/ omit : 输出规范形式，j/q/x/y 后的 ü 一律省两点（jū）
 *   keep              : 输出字面形式，一律保留两点（jǖ）
 * 默认必须是规范形式：省两点是国标要求，`jǖ` 只有明确要字面写法时才该出现。
 * auto 与 omit 等价，保留 auto 只是让「不传参数」有个名字。
 * @param {string} abbr
 * @param {'auto'|'keep'|'omit'} style
 * @returns {string}
 */
function resolveSpelling(abbr, style) {
    if (style === 'keep') return toLiteralSpelling(abbr);
    return toCanonicalSpelling(abbr);
}

function normalizeOptions(options) {
    const raw = options?.umlaut;
    // 只有 undefined 表示「没传」，null 也算显式给了一个非法值
    const style = raw === undefined ? 'auto' : raw;
    if (!UMLAUT_STYLES.has(style)) {
        throw new TypeError(
            `umlaut must be one of ${[...UMLAUT_STYLES].map((s) => `'${s}'`).join(', ')}, got ${JSON.stringify(style)}`
        );
    }
    return style;
}

/**
 * @param {string} longString
 * @param {{ umlaut?: 'auto'|'keep'|'omit' }} [options]
 * @return {string}
 */
function toPinyinTones(longString, options) {
    const style = normalizeOptions(options);
    const stringArray = longString.trim().split(' ');

    return stringArray.map((str) => {
        const match = regex.exec(str);

        // 不是完整的拼音串（大写、标点、多音节连写、非法声调）-> 原样返回，与 v1 行为一致
        if (!match) {
            return str; // is NOT pinyin
        }

        const syllables = pinyin_dict_v2[resolveSpelling(match.groups.abc, style)];

        // 形状像拼音但不在词表内 -> 原样返回
        if (!syllables) {
            return str; // is NOT pinyin
        }

        // 空 / 0 / 5 都表示轻声，对应词表下标 0
        const num = match.groups.num;
        const tone = num === '' || num === '0' || num === '5' ? 0 : Number(num);

        return syllables[tone] ?? str; // is pinyin
    }).join(' ');
}

/**
 * split syllables string by number
 * @param {string} text
 * @returns {string}
 */
function splitUnspacedSyllables(text){
    // insert a separator between each number
    return text.replace(/(\d)/g, '$1 ') // add space after each number
    .replace(/\s+/g, ' ') // remove multiple spaces
    .trim() // remove leading and trailing spaces
}

/**
 * output pinyin string without space like "hànyǔpīnyīn"
 * @param {string} unspacedSyllables unspaced pinyin string like "han4yu3pin1yin1"
 * @param {{ umlaut?: 'auto'|'keep'|'omit' }} [options]
 * @returns {string}
 */
function convertUnspacedPinyin(unspacedSyllables, options){
    return toPinyinTones(splitUnspacedSyllables(unspacedSyllables), options).split(' ').join('')
}

export default toPinyinTones;
export {splitUnspacedSyllables};
export {convertUnspacedPinyin};
