// lib/index.d.ts

/**
 * Which runs stay as written: one run, or a set of runs.
 *
 * The comparison is against **the whole run** and is case-sensitive — `'M2'` cannot touch
 * `M20` (a different run) or `m2`. No marker characters are written into the input, so a
 * backslash or a brace in the text is just ordinary text.
 *
 * `RegExp` and functions are not accepted: all this can see is one run at a time, so a
 * lookaround has no neighbouring characters to inspect, `^`/`$` anchor to the ends of the run
 * rather than the ends of the text, and there is nowhere for `g`/`y`'s stateful iteration to
 * live — something that reads as if it works but silently does not is worse than not
 * supporting it. To match by pattern, work out which runs to keep first
 * (`text.matchAll(...)`) and pass the resulting list of strings.
 */
export type SkipSpec = string | readonly string[];

export interface MarkTonesOptions {
    /**
     * Accept only the 426 syllables of Standard Mandarin; the 418 erhua syllables follow
     * from their base form.
     *
     * The default, `false`, accepts all 1,952 dictionary keys, including the cartesian
     * product of initials and finals such as `jui`, `juang` and `juei`, the non-standard but
     * spoken forms `duang`, `biu` and `biong`, and spellings that treat v as a consonant such
     * as `vai`.
     *
     * When `true`, a syllable outside the whitelist comes back as written (no partial
     * output). Erhua follows its base: `huar` is legal because `hua` is.
     */
    strict?: boolean;

    /**
     * Runs to keep as written. Without this field everything converts.
     *
     * All-caps Latin strings with digits, such as `M2`, `A4` and `O2`, collide with pinyin
     * (`m`, `a` and `o` are syllables on their own). Declaring them once here is enough:
     *
     * ```js
     * markTones('M2 货币供应量', {skip: 'M2'});     // 'M2 货币供应量'
     * markTones('M2 A4 N3', {skip: ['M2', 'A4']});  // 'M2 A4 Ň'
     * ```
     *
     * A rule covers every occurrence of that run: within one call a given run can only be
     * handled one way. To treat two occurrences differently, cut the text and call once per
     * part.
     *
     * Only runs that would convert are asked about; a run that would come out unchanged
     * either way is never consulted.
     */
    skip?: SkipSpec;
}

/**
 * Mark pinyin written in ASCII with tone marks: `hao3` -> `hǎo`. Pinyin mixed into Chinese
 * is recognised too: `今天ni3hao3` -> `今天nǐhǎo`; every other character is copied through,
 * and leading or trailing whitespace is not trimmed.
 *
 * Spaces are not required. The implementation takes candidate runs from the text and cuts
 * each one into syllables at its tone digits, so both `ni3hao3` and `ni3 hao3` work. A digit
 * may be omitted only on the last syllable: `ni3hao3ma` -> `nǐhǎoma`, while `ni3haoma5`
 * stays as written because `haoma` is not a syllable. A run glued to an English word
 * (`abcju1`, `ju1abc`) or containing an underscore (`ni3_hao3`) is left alone.
 *
 * If a run is not fully recognised (`a1b2c3`, `hua1r`, `ma6`, mixed case inside a syllable)
 * that run comes back as written — no partial output — while other runs in the same string
 * still convert. A run with no tone digit to cut at, such as `hanyu3pin1yin1`, is not guessed
 * at either.
 *
 * Three cases are accepted and carried into the output: `Zhong1guo2` -> `Zhōngguó`,
 * `BEI3JING1` -> `BĚIJĪNG` (the spelling standard's own all-caps example keeps its tone
 * marks). Case is decided per syllable, so `ZHONG1guo2` -> `ZHŌNGguó`; mixing case inside a
 * syllable (`hAo3`) is not something the standard writes, and the run stays as written.
 *
 * Runs that should not convert go into the `skip` option (see above): the input carries no
 * marker characters, so text containing a backslash or a brace (paths, LaTeX, templates)
 * loses nothing.
 *
 * After `j`/`q`/`x`/`y` the two dots over `ü` are dropped as 汉语拼音方案 requires, so the
 * output is always the standard spelling: `jv1` and `ju1` both give `jū`. To keep the dots
 * somewhere, write an ASCII colon, which has exactly two legal positions: right after the
 * `u` (or `v`) that carries them, or at the very end of the syllable — `ju:1` -> `jǖ`
 * (`jv:1` means the same), `jvan:1` -> `jüān`, `jv:an1` -> `jüān`. The colon does not end
 * the syllable; the letters after it belong to the same final: `lu:e4` -> `lüè`. Anywhere
 * else (`j:van1`, `jva:n1`) is a mistake and the run stays as written. There is no option to
 * switch the whole string to the literal spelling.
 * After `n`/`l` the dots are kept anyway (`nv3` -> `nǚ`) and are unaffected.
 *
 * `ê` (欸 / 诶) is written `e^`: `^` is that circumflex. `e^2` -> `ế`, `e^4` -> `ề`, and
 * without a digit it is `ê`. `^` is accepted only on `e`; after any other letter (`be^2`)
 * the run stays as written.
 */
export function markTones(text: string, options?: MarkTonesOptions): string;
