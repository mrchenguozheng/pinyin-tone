// v2/index.d.ts

export default function toPinyinTones(longString: string): string;
/** Insert a space after every tone digit and collapse the rest. Returns a string, not an array. */
export function splitUnspacedSyllables(text: string): string;
export function convertUnspacedPinyin(unspacedLongString: string): string;
