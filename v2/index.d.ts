// v2/index.d.ts

/**
 * j/q/x/y 与 ü 相拼的两种拼写：
 *   'auto' 默认，等同 'omit'，输出国标规范形式（jv -> jū）
 *   'omit' 规范形式，按国标省两点（jv -> jū）
 *   'keep' 字面形式，保留两点（ju -> jǖ）
 *   'as-written' 跟随每一处输入的写法（jv -> jǖ，ju -> jū）
 * 规范是默认：写在 `j`/`q`/`x`/`y` 后的 `ü` 按《汉语拼音方案》应省两点。
 * n/l 后的 ü 不受影响（nǚ / lǜ 在所有模式下都保留两点）。
 */
export type UmlautStyle = 'auto' | 'omit' | 'keep' | 'as-written';

export interface ToPinyinTonesOptions {
    umlaut?: UmlautStyle;
}

export interface PinyinTonesVariants {
    /** 规范形式：j/q/x/y 后的 ü 省两点（jū） */
    canonical: string;
    /** 字面形式：保留 ü 的两点（jǖ） */
    literal: string;
}

export default function toPinyinTones(longString: string, options?: ToPinyinTonesOptions): string;
export function splitUnspacedSyllables(text: string): string;
export function convertUnspacedPinyin(unspacedSyllables: string, options?: ToPinyinTonesOptions): string;
/** 一次拿到同一输入的规范形式与字面形式 */
export function toPinyinTonesVariants(longString: string): PinyinTonesVariants;
/**
 * 转换中文与拼音混排的整句，只替换其中的拼音片段，其余字符原样保留。
 * 裸写 `ju1` / `jv1` 按 `umlaut` 选项输出（默认规范形式 `jū`）；
 * `ju:1` 用冒号表示 u 上面的两点，输出字面形式 `jǖ`；`u:` / `u:1` 输出 `ü` / `ǖ`。
 */
export function toPinyinTonesInline(text: string, options?: ToPinyinTonesOptions): string;
