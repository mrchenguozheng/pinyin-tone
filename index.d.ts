// index.d.ts

declare module './v1/index.js' {
    export default function toPinyinTones(input: string): string;
}

declare module './v2/index.js' {
    export default function v2(input: string): string;
}

declare module './workaround/index.js' {
    export default function markSinglePinyinVowel(input: string): string;
}