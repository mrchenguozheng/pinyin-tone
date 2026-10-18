// v2/index.d.ts

export interface PinyinTonesVariants {
    /** 规范形式：j/q/x/y 后的 ü 省两点（jū） */
    canonical: string;
    /** 字面形式：保留 ü 的两点（jǖ） */
    literal: string;
}

/**
 * 转换拼音串。一个 token 可以是单个音节，也可以是若干音节连写 ——
 * 声调数字就是分隔符，`ni3hao3` -> `nǐhǎo`。输出保持输入的分隔方式：
 * 连写不补空格，写了的空格还在，ASCII 标点原样保留（`ni3,hao3` -> `nǐ,hǎo`）。
 *
 * 任何一段认不出来（`a1b2c3`、`hua1r`、`ma6`、大写字母、汉字）就整串原样返回，
 * 不会输出半截结果。`hanyu3pin1yin1` 这类没有声调数字可切的地方也不猜。
 *
 * `j`/`q`/`x`/`y` 与 `ü` 相拼时按《汉语拼音方案》省两点，因此默认输出规范形式：
 * `jv1` 与 `ju1` 都得到 `jū`。要某处保留两点，就在 `u`（或 `v`）后写一个英文冒号：
 * `ju:1` -> `jǖ`（`jv:1` 同义），`jvan:1` -> `jüān`。冒号不结束音节，其后的字母仍属同一
 * 韵母：`lu:e4` -> `lüè`。
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
 * `ju:1` 用冒号表示那个 u 上面的两点，输出字面形式 `jǖ`（`jv:1` 同义）；
 * `u:` / `u:1` / `v:` / `v:1` 输出 `ü` / `ǖ`。
 */
export function toPinyinTonesInline(text: string): string;
