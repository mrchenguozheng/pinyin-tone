'use strict';
import pinyin_dict_v2 from './dict.js';

const regex = /(?<abc>[a-z]+)(?<num>[01234^]?)/;

/**
 *
 * @param {string} longString
 * @return {string}
 */
function toPinyinTones(longString) {
    const stringArray = longString.trim().split(' ');

    return stringArray.map((str) => {
        const match = regex.exec(str);
        // if match and not undefined
        if (match && pinyin_dict_v2[match.groups.abc]) {
            return pinyin_dict_v2[match.groups.abc][parseInt(match.groups.num) || 0]; // is pinyin
        }
        return str; // is NOT pinyin
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
