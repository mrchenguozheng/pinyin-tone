// workaround/index.d.ts
//
// A plain module, not a `declare module '...'` block: the string form turns the file into an
// ambient script, and a consumer importing this path gets TS2306 "is not a module".
/**
 * Marks a single Pinyin vowel
 * @param vowelChar - The input vowel character
 * @returns The marked vowel or the original vowel
 */
export default function markSinglePinyinVowel(vowelChar: string): string;
