// lib/index.d.ts

export interface PinyinTonesVariants {
    /** 规范形式：j/q/x/y 后的 ü 省两点（jū） */
    canonical: string;
    /** 字面形式：保留 ü 的两点（jǖ） */
    literal: string;
}

export interface PinyinTonesOptions {
    /**
     * 只认普通话的 426 个音节，另有 418 条儿化由基底决定。
     *
     * 默认 `false`：词表 1952 个键全部放行，包括 `jui`、`juang`、`juei` 这类
     * 「声母 × 韵母」笛卡尔积的产物，也包括 `duang`、`biu`、`biong` 这类非标准
     * 但在用的口语音，以及 `vai` 这种把 v 当辅音的写法。
     *
     * 置 `true` 时，白名单之外的音节整串原样返回（不会输出半截结果）。
     * 儿化跟着基底走：`huar` 合法是因为 `hua` 合法。
     */
    strict?: boolean;
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
 *
 * `ê`（欸 / 诶）写作 `e^`：`^` 就是那个扬抑符。`e^2` -> `ế`、`e^4` -> `ề`，
 * 不带数字则是 `ê`。`^` 只认 `e`，写在别的字母后面（`be^2`）整串原样。
 */
export default function toPinyinTones(longString: string, options?: PinyinTonesOptions): string;
export function convertUnspacedPinyin(unspacedSyllables: string, options?: PinyinTonesOptions): string;
/** 一次拿到同一输入的规范形式与字面形式 */
export function toPinyinTonesVariants(longString: string, options?: PinyinTonesOptions): PinyinTonesVariants;
/**
 * 转换中文与拼音混排的整句，只替换其中的拼音片段，其余字符原样保留。
 * 裸写 `ju1` / `jv1` 输出规范形式 `jū`；
 * `ju:1` 用冒号表示那个 u 上面的两点，输出字面形式 `jǖ`（`jv:1` 同义）；
 * `u:` / `u:1` / `v:` / `v:1` 输出 `ü` / `ǖ`。
 */
export function toPinyinTonesInline(text: string, options?: PinyinTonesOptions): string;
