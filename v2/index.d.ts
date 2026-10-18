// v2/index.d.ts

/**
 * j/q/x/y 与 ü 相拼的两种拼写：
 *   'auto' 默认，等同 'omit'，输出国标规范形式（jv -> jū）
 *   'omit' 规范形式，按国标省两点（jv -> jū）
 *   'keep' 字面形式，保留两点（ju -> jǖ）
 * 规范是默认：写在 `j`/`q`/`x`/`y` 后的 `ü` 按《汉语拼音方案》应省两点。
 * n/l 后的 ü 不受影响（nǚ / lǜ 在三种模式下都保留两点）。
 */
export type UmlautStyle = 'auto' | 'omit' | 'keep';

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
