'use strict';
import pinyin_dict_v2 from './dict.js';

// 整串必须完全匹配：纯小写字母 + 一个可选声调数字。
// 不加锚点会静默截断输入（"ni3hao3" -> "nǐ"、"ma6" -> "ma"），
// 大写字母还会被跳过而错位匹配（"Hao3" -> "ǎo"）。
const regex = /^(?<abc>[a-z]+)(?<num>[0-5]?)$/;

/**
 *
 * @param {string} longString
 * @return {string}
 */
function toPinyinTones(longString) {
    const stringArray = longString.trim().split(' ');

    return stringArray.map((str) => {
        const match = regex.exec(str);

        // 不是完整的拼音串（大写、标点、多音节连写、非法声调）-> 原样返回，与 v1 行为一致
        if (!match) {
            return str; // is NOT pinyin
        }

        const syllables = pinyin_dict_v2[match.groups.abc];

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
 * @returns {string}
 */
function convertUnspacedPinyin(unspacedSyllables){
    return toPinyinTones(splitUnspacedSyllables(unspacedSyllables)).split(' ').join('')
}

export default toPinyinTones;
export {splitUnspacedSyllables};
export {convertUnspacedPinyin};
