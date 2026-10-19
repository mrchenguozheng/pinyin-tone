// v1/index.d.ts
//
// A plain module, not a `declare module '...'` block: the string form turns the file into an
// ambient script, and a consumer importing this path gets TS2306 "is not a module".
/**
 * Convert "letter + number" to "Pinyin tone"
 * @param args - A string, e.g., "ma1 ma2 ma3 ma4 ma"
 * @returns Returns the Pinyin with tones, e.g., "mā má mǎ mà ma"
 */
export default function pinyin_v1(args: string): string;
