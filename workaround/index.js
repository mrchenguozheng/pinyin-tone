const SinglePinyinVowelDict = Object.freeze({
    // Light tone dictionary, includes different tones of vowels
    a: 'a',    // Light tone 'a'
    a0: 'a',   // Light tone 'a'
    a5: 'a',   // Light tone 'a', the other digit for it
    a1: 'ā',   // First tone 'ā'
    a2: 'á',   // Second tone 'á'
    a3: 'ǎ',   // Third tone 'ǎ'
    a4: 'à',   // Fourth tone 'à',

    o: 'o',    // Light tone 'o'
    o0: 'o',   // Light tone 'o'
    o5: 'o',   // Light tone 'o', the other digit for it
    o1: 'ō',   // First tone 'ō'
    o2: 'ó',   // Second tone 'ó'
    o3: 'ǒ',   // Third tone 'ǒ'
    o4: 'ò',   // Fourth tone 'ò',

    e: 'e',    // Light tone 'e'
    e0: 'e',   // Light tone 'e'
    e5: 'e',   // Light tone 'e', the other digit for it
    e1: 'ē',   // First tone 'ē'
    e2: 'é',   // Second tone 'é'
    // e3: 'ĕ', // Commented out sound
    e3: 'ě',   // Third tone 'ě'
    e4: 'è',   // Fourth tone 'è'
    // e5: 'ê',  // Rising tone 'ê'

    i: 'i',    // Light tone 'i'
    i0: 'i',   // Light tone 'i'
    i5: 'i',   // Light tone 'i', the other digit for it
    i1: 'ī',   // First tone 'ī'
    i2: 'í',   // Second tone 'í'
    i3: 'ǐ',   // Third tone 'ǐ'
    i4: 'ì',   // Fourth tone 'ì',

    u: 'u',    // Light tone 'u'
    u0: 'u',   // Light tone 'u'
    u5: 'u',   // Light tone 'u', the other digit for it
    u1: 'ū',   // First tone 'ū'
    u2: 'ú',   // Second tone 'ú'
    u3: 'ǔ',   // Third tone 'ǔ'
    u4: 'ù',   // Fourth tone 'ù',

    v: 'ü',    // Light tone 'ü'
    v0: 'ü',   // Light tone 'ü'
    v5: 'ü',   // Light tone 'ü', the other digit for it
    v1: 'ǖ',   // First tone 'ǖ'
    v2: 'ǘ',   // Second tone 'ǘ'
    v3: 'ǚ',   // Third tone 'ǚ'
    v4: 'ǜ',   // Fourth tone 'ǜ'
})

/**
 * Mark the vowel
 * @param {string} vowelChar - Input vowel
 * @returns {string} - Returns the corresponding marked vowel or the original vowel
 */
function markSinglePinyinVowel(vowelChar) {
    // Ask the table itself, not Object.prototype: 'toString' and 'constructor' are inherited
    // names, so a plain lookup hands back a function, and '__proto__' hands back an object.
    // This function is declared to return a string, so an unknown key has to come back as
    // the key itself -- which is what a caller passing a name that is not a vowel expects.
    if (Object.prototype.hasOwnProperty.call(SinglePinyinVowelDict, vowelChar)) {
        return SinglePinyinVowelDict[vowelChar];
    }
    return vowelChar;
}

export default markSinglePinyinVowel; // 导出函数