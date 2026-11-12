import toPinyinTonesV1 from "pinyin-tone";
import toPinyinTonesV2, { convertUnspacedPinyin } from "pinyin-tone/v2/index.js";
import { markTones } from "pinyin-tone-v3";

/**
 * The three published generations of `pinyin-tone`, side by side.
 *
 * `pinyin-tone` stays pinned to 2.x here, because that is the last line that ships the
 * `v1` and `v2` subpaths this page demonstrates. 3.0 removed both and replaced them with a
 * single named `markTones`, so it is installed under the alias `pinyin-tone-v3`.
 */
export const toPinyin = {
	/** v1 — the original root export of 2.x. Pattern-based, folds `liou` to `liu`. */
	v1: toPinyinTonesV1,
	/** v2 — table-based, keeps the full forms of the finals. */
	v2: toPinyinTonesV2,
	/** v2's unspaced helper. */
	convertUnspacedPinyin,
	/** v3 — the 3.0 rewrite. Named export only, no default. */
	v3: markTones,
	/** 3.0 removed `convertUnspacedPinyin`; gluing the output is a call-site decision. */
	v3Unspaced: (text: string, options?: Parameters<typeof markTones>[1]) =>
		markTones(text, options).replace(/ /g, ""),
};
