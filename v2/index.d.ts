// v2/index.d.ts

/**
 * j/q/x/y 与 ü 相拼的两种拼写：
 *   'auto' 跟随输入（ju -> jū，jv -> jǖ），默认
 *   'omit' 规范形式，按国标省两点（jv -> jū）
 *   'keep' 字面形式，保留两点（ju -> jǖ）
 * n/l 后的 ü 不受影响（nǚ / lǜ 在三种模式下都保留两点）。
 */
export type UmlautStyle = 'auto' | 'omit' | 'keep';

export interface ToPinyinTonesOptions {
    umlaut?: UmlautStyle;
}

export default function toPinyinTones(longString: string, options?: ToPinyinTonesOptions): string;
export function splitUnspacedSyllables(text: string): string;
export function convertUnspacedPinyin(unspacedSyllables: string, options?: ToPinyinTonesOptions): string;
