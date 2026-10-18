// v2/index.d.ts

export interface PinyinTonesVariants {
    /** 规范形式：j/q/x/y 后的 ü 省两点（jū） */
    canonical: string;
    /** 字面形式：保留 ü 的两点（jǖ） */
    literal: string;
}

/**
 * 转换以空格分隔的拼音串。
 *
 * `j`/`q`/`x`/`y` 与 `ü` 相拼时按《汉语拼音方案》省两点，因此默认输出规范形式：
 * `jv1` 与 `ju1` 都得到 `jū`。要某处保留两点，就在 `u`（或 `v`）后写一个英文冒号：
 * `ju:1` / `jv:1` -> `jǖ`，`jvan:1` -> `jüān`。
 * `n`/`l` 后的 ü 本来就保留两点（`nv3` -> `nǚ`），不受影响。
 */
export default function toPinyinTones(longString: string): string;
export function splitUnspacedSyllables(text: string): string;
export function convertUnspacedPinyin(unspacedSyllables: string): string;
/** 一次拿到同一输入的规范形式与字面形式 */
export function toPinyinTonesVariants(longString: string): PinyinTonesVariants;
/**
 * 转换中文与拼音混排的整句，只替换其中的拼音片段，其余字符原样保留。
 * 裸写 `ju1` / `jv1` 输出规范形式 `jū`；
 * `ju:1` / `jv:1` 用冒号表示 u（ü）上面的两点，输出字面形式 `jǖ`；
 * `u:` / `u:1` / `v:` / `v:1` 输出 `ü` / `ǖ`。
 */
export function toPinyinTonesInline(text: string): string;
