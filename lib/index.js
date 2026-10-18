'use strict';
import pinyinDict from './dict.js';
import coreSyllables from './core.js';

// A single syllable has to match the whole string: letters (either case), at most one
// diacritic marker (^ or :), then an optional tone digit. Without the anchors the input is
// silently truncated ("ma6" -> "ma"); the old version also accepted only lowercase and had
// no anchors, so "Hao3" matched from after the H and produced "ǎo".
const regex = /^(?<abc>[A-Za-z]+)(?<hat>\^?)(?<mark>:?)(?<num>[0-5]?)$/;

// Splitting a run into syllables: a token is one or more pieces of "letters, optional
// circumflex, optional colon, optional trailing letters, optional tone".
// The greedy [A-Za-z]+ stops at a tone digit, so "ni3hao3" naturally splits into
// ni3 | hao3 — a tone digit is the only reliable separator in unspaced pinyin, and no
// syllable-level disambiguation is needed.
//
// Letters after the colon (after) belong to the same piece: the colon only says "this u
// carries two dots", it is not a syllable boundary. "lu:e4" therefore reads
// lü + e + fourth tone = lüè, not lü + é.
const segment = /(?<abc>[A-Za-z]+)(?<hat>\^?)(?<mark>:?)(?<after>[A-Za-z]*)(?<num>[0-5]?)/g;

// Between syllables only ASCII punctuation and whitespace are allowed. As soon as a gap
// holds a letter, a digit or a Han character, this token is not "pinyin plus punctuation"
// (English words, mixed case, an illegal tone, text interleaved with Chinese all land
// here). The whole token is left as written rather than guessed at and cut up.
const foreign = /[A-Za-z0-9]|\p{Script=Han}/u;

// The colon in "u:" stands for the two dots over ü: ju:1 reads jü + first tone and gives
// jǖ. It exists for US keyboards — a way to write the two dots without leaving ASCII.
// Before the colon u and v are equivalent: jv:1 means the same thing (v already is the
// ASCII writing of ü).
//
// The ^ in "e^" is the same idea applied differently: it stands for the circumflex over ê.
// ê is the only pinyin letter that carries a circumflex (欸 and 诶 are read ê), so ^ is
// accepted only on e — be^2 and x^2 come back as written, with no guessing that "moves ^
// onto some letter". ê has no u in it, so the colon has nowhere to land and ^ and : are
// mutually exclusive (e^:1 does not exist).

// ------------------------------------------------------- the two spellings of ü
//
// After j/q/x/y a syllable has two spellings:
//   standard (GB)    ju  jue  juan  jun   <- the two dots are dropped, as the standard says
//   literal (kept)   jv  jve  jvan  jvn   <- the dictionary writes ü as v (ASCII input)
// Both spell the same phoneme, not two different syllables, so converting between them
// loses nothing.
//
// This holds only after j/q/x/y: after those four initials a u is never a real u (they are
// in complementary distribution). After n/l, u and ü contrast (nǔ 努 / nǚ 女, lù 路 /
// lǜ 绿) and must not be converted.
const UMLAUT_HEADS = 'jqxy';

// The finals that drop the dots: ü / üe / üan / ün, plus their erhua forms. This has to be
// an explicit closed set — a prefix test like /^u/ would also match jui/jua/juo/juai/juei/
// juen/juang/jueng, the impossible syllables the cartesian product leaves in the
// dictionary, and turn them into jüí/jüá.
const UMLAUT_FINALS = new Set(['u', 'ue', 'uan', 'un', 'ur', 'uer', 'uanr', 'unr']);

/**
 * Literal spelling -> standard spelling (jv -> ju). Only inside the whitelist.
 * @param {string} abbr
 * @returns {string}
 */
function toCanonicalSpelling(abbr) {
    if (abbr.length >= 2 && UMLAUT_HEADS.includes(abbr[0]) && abbr[1] === 'v'
        && UMLAUT_FINALS.has('u' + abbr.slice(2))) {
        return abbr[0] + 'u' + abbr.slice(2);
    }
    return abbr;
}

/**
 * Standard spelling -> literal spelling (ju -> jv). Only inside the whitelist.
 * @param {string} abbr
 * @returns {string}
 */
function toLiteralSpelling(abbr) {
    if (abbr.length >= 2 && UMLAUT_HEADS.includes(abbr[0]) && abbr[1] === 'u'
        && UMLAUT_FINALS.has(abbr.slice(1))) {
        return abbr[0] + 'v' + abbr.slice(2);
    }
    return abbr;
}

/**
 * Does strict mode accept this dictionary key?
 *
 * The dictionary carries 1,952 keys so that input is forgiven; 1,110 of them come from the
 * cartesian product of initials and finals (jui, juang, juei, biong), while strict mode
 * accepts only the 426 syllables of Standard Mandarin.
 * Erhua is not listed separately: whether huar is legal follows entirely from hua, so the
 * check drops the trailing r and looks again — none of the 418 erhua syllables needs a line
 * in core.js.
 * @param {string} key
 * @returns {boolean}
 */
function isCoreSyllable(key) {
    if (coreSyllables.has(key)) return true;

    // The literal spellings (jv / jve / jvan / jvn) are the same phoneme as the standard
    // ones and core.js lists only the standard form. Converting first and then testing for
    // erhua is what lets jver go through juer -> jue + r.
    const canonical = toCanonicalSpelling(key);
    if (coreSyllables.has(canonical)) return true;

    return canonical.length > 1 && canonical.endsWith('r')
        && coreSyllables.has(canonical.slice(0, -1));
}

/**
 * Look up the **toneless form** of a syllable. The spelling asked for is tried first, then
 * the other spelling as a fallback: after j/q/x/y the dictionary has keys in both spellings,
 * so converting is safe, and the fallback means that clearing the redundant jv keys later
 * will not break the literal form outright.
 *
 * Under strict, both spellings have to pass the core whitelist before the lookup — otherwise
 * jv1 would slip past strict mode through the fallback.
 * @param {string} abbr
 * @param {boolean} literal true for the literal spelling (jü), false for standard (ju)
 * @param {boolean} strict accept only the 426 syllables of Standard Mandarin
 * @returns {string|undefined}
 */
function lookupBase(abbr, literal, strict) {
    const keys = literal
        ? [toLiteralSpelling(abbr), toCanonicalSpelling(abbr)]
        : [toCanonicalSpelling(abbr), toLiteralSpelling(abbr)];

    for (const key of keys) {
        if (strict && !isCoreSyllable(key)) continue;

        const base = pinyinDict[key];
        if (base !== undefined) return base;
    }
    return undefined;
}

/**
 * Empty, 0 and 5 all mean the neutral tone, which takes no mark.
 * @param {string} num
 * @returns {number}
 */
function toneIndex(num) {
    return num === '' || num === '0' || num === '5' ? 0 : Number(num);
}

// Tone marks for tones 1 to 4. The neutral tone adds nothing, hence the 1-based index.
// The m and n rows are the fallback for interjection syllables with no vowel — the mark
// goes on the nasal itself (ḿ, hńg).
// An array is used instead of a string for indexing: m̄ / m̌ / m̀ / n̄ are two code points
// ("letter + combining mark"), and indexing a string would return half a character.
const TONE_MARKS = {
    a: ['ā', 'á', 'ǎ', 'à'],
    o: ['ō', 'ó', 'ǒ', 'ò'],
    e: ['ē', 'é', 'ě', 'è'],
    i: ['ī', 'í', 'ǐ', 'ì'],
    u: ['ū', 'ú', 'ǔ', 'ù'],
    'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    // ê already carries a circumflex and the tone mark stacks on top. Tones 2 and 4 have
    // precomposed characters (ế U+1EBF / ề U+1EC1); tones 1 and 3 do not, so they can only
    // be written as two code points, "ê + combining mark".
    'ê': ['ê\u0304', 'ế', 'ê\u030c', 'ề'],
    m: ['m\u0304', 'ḿ', 'm\u030c', 'm\u0300'],
    n: ['n\u0304', 'ń', 'ň', 'ǹ'],
};

// Priority among main vowels: a > o > e. Marking u in iu and i in ui falls out of "take the
// last one" for free.
// ê needs its own entry — it is not e, and indexOf('e') finds nothing in "ê".
// Putting it last is safe: the only syllable containing ê is ê itself, which never occurs
// alongside a / o / e.
const MAIN_VOWELS = ['a', 'o', 'e', 'ê'];

// The vowels other than a/o/e/ê. Marking u in iu and i in ui falls out of "take the last
// one" for free.
const CLOSING_VOWELS = 'iuü';

// Where the tone lands in an interjection syllable: the last m or n (m -> ḿ, hng -> hńg,
// ng -> ńg).
const NASALS = 'mn';

// The combinations that actually occur for interjection syllables in the dictionary
// (pypinyin's pinyin_dict, whose readings follow 现代汉语词典). The glyphs are copied
// entry by entry from that table:
//   m    m̄ 嘸 / ḿ 呒呣唔嘸 / m̀ 呣      -- no third tone
//   n    ń 咹哽唔嗯 / ň 㕶嗯 / ǹ 哏嗯   -- no first tone
//   ng   ńg 哽唔嗯 / ňg 㕶嗯 / ǹg 嗯   -- no first tone
//   hm   噷                            -- toneless only
//   hng  哼                            -- toneless only
//
// This table is a **preference list**, not a closed set: a glyph listed here is used as
// written, and anything else is generated by the rule "mark the last nasal". So m3, n1, ng1
// and the four tones of hm / hng still convert — `m3` gives `m̌`, `hng2` gives `hńg`. Those
// 11 forms are extrapolated and are not in the dictionary; they leave through the same exit
// as the 9 attested forms above, with no difference in the output.
//
// The 9 values here currently agree with what the rule computes, entry for entry (so the
// tests would still pass with this table deleted). It is kept so that the attested cells do
// not drift with the rule: if the landing position or the code-point spelling changes later,
// these 9 glyphs still come out the way the dictionary writes them instead of being quietly
// rewritten by the rule.
// m̄ / m̀ are two code points ("letter + combining mark"); writing them here is less
// error-prone than assembling them elsewhere.
const NASAL_TONES = {
    m: {1: 'm\u0304', 2: 'ḿ', 4: 'm\u0300'},
    n: {2: 'ń', 3: 'ň', 4: 'ǹ'},
    ng: {2: 'ńg', 3: 'ňg', 4: 'ǹg'},
    hm: {},
    hng: {},
};

/**
 * Put a tone mark on a toneless syllable: mark a if there is one, else o, else e (ê counts
 * as e, except that it already has a circumflex and needs its own lookup), else the last
 * vowel (iu -> u, ui -> i). A trailing erhua r is not a vowel and does not affect the choice.
 *
 * A syllable with no vowel at all (m, n, ng, hm, hng) is looked up in NASAL_TONES first: if
 * the dictionary has that tone, its glyph is used; otherwise the same rule generates one,
 * marking the last m or n (m3 -> m̌, hng2 -> hńg). The table is checked first so that the
 * code points of "letter + combining mark" forms such as m̄ / m̀ stay fixed — the rule
 * computes the same result.
 *
 * The dictionary stores only toneless forms and the four tones are generated here. They are
 * the same rule unrolled, so four pre-generated strings and one computed value agree entry
 * for entry (verified over the whole table, 1,952 x 5). The neutral tone (tone 0) adds
 * nothing.
 * @param {string} base
 * @param {number} tone 0-4
 * @returns {string|null} null when no mark can be added (not a known interjection syllable)
 */
function applyToneMark(base, tone) {
    if (tone === 0) return base;

    let at = -1;
    for (const vowel of MAIN_VOWELS) {
        at = base.indexOf(vowel);
        if (at !== -1) break;
    }

    if (at === -1) {
        for (let i = base.length - 1; i >= 0; i -= 1) {
            if (CLOSING_VOWELS.includes(base[i])) {
                at = i;
                break;
            }
        }
    }

    if (at === -1) {
        const closed = NASAL_TONES[base];
        if (closed && closed[tone]) return closed[tone];

        for (let i = base.length - 1; i >= 0; i -= 1) {
            if (NASALS.includes(base[i])) {
                const nasalMarks = TONE_MARKS[base[i]];
                return nasalMarks
                    ? base.slice(0, i) + nasalMarks[tone - 1] + base.slice(i + 1)
                    : null;
            }
        }
        return null;
    }

    const marks = TONE_MARKS[base[at]];
    return marks ? base.slice(0, at) + marks[tone - 1] + base.slice(at + 1) : base;
}

/**
 * Look up the toneless form and add the tone. Returns null when the syllable is not
 * recognised, leaving the fallback to the caller.
 * The default output is the standard spelling: after j/q/x/y, ü always drops the dots
 * (jv1 -> jū), as 汉语拼音方案 requires; the literal spelling (jǖ) appears only when a colon
 * was written.
 * @param {string} abc
 * @param {string} num
 * @param {boolean} literal
 * @param {boolean} strict
 * @returns {string|null}
 */
function renderSyllable(abc, num, literal, strict) {
    const base = lookupBase(abc, literal, strict);
    if (base === undefined) return null;
    return applyToneMark(base, toneIndex(num));
}

/**
 * Turn the letter the colon sits on back into ü: u -> v (the dictionary writes ü as v).
 *   ju:1   -> jv      juan:1 -> jvan      nu:3 -> nv
 *   gu:1   -> gv      u:1    -> v         u:e1 -> ve
 *
 * The colon belongs on the u — u is the letter that takes the two dots. The v in `jv:` is
 * already the ASCII writing of ü, so the colon says the same thing twice, but it is not
 * ambiguous and is therefore handled exactly like `ju:` rather than treated as an error:
 * jv:1 and ju:1 both mean jǖ.
 *
 * The initial is not filtered: the colon is something the caller wrote explicitly, and it
 * asks for ü wherever it lands. `gu:1` giving `gǖ` and `u:e1` giving `üē` — syllables that
 * are not standard — is one of the reasons this package exists: it has to produce non-standard
 * spellings as well as standard ones. Whether to use them is the caller's decision, not the
 * converter's.
 *
 * With no u or v in the syllable there is nowhere to land (ma:1, ji:1), so this returns null
 * and the caller returns the token unchanged.
 * @param {string} abc
 * @returns {string|null}
 */
function dottedKey(abc) {
    const i = abc.search(/[uv]/);
    if (i === -1) return null;

    // v is already the dictionary's spelling; only u has to become v
    return abc[i] === 'v' ? abc : abc.slice(0, i) + 'v' + abc.slice(i + 1);
}

// ------------------------------------------------------------------- letter case
//
// 汉语拼音方案 only defines the alphabet (each letter has an uppercase and a lowercase
// form). How case is used belongs to 汉语拼音正词法基本规则 (GB/T 16159—2012) §6.3: the
// start of a sentence and of each line of verse, the first letter of a proper name, the
// first letter of every word in a multi-word name, and "in some contexts proper names may
// be written entirely in capitals" (BĚIJĪNG, LǏ HUÁ). The tone rules in §6.5 make no
// exception for capitals, so tone marks go on the capital vowels in those contexts —
// Ě Ī Ǎ Ǔ Ǚ Ế are not invented glyphs.
//
// Three forms are therefore accepted: all lowercase, initial capital, all capitals. Mixing
// case inside a syllable (hAo3, HaO3) is not something the standard writes, so it counts as
// unrecognised and the whole run comes back as written. The form is decided per **syllable**,
// not per token: the second syllable of Zhong1guo2 is still all lowercase, giving Zhōngguó.
const LOWER = 0;
const TITLE = 1;
const UPPER = 2;

/**
 * Read the letter case of one syllable.
 * @param {string} letters every letter of the syllable (abc + after)
 * @returns {number} LOWER / TITLE / UPPER; -1 when the case is mixed
 */
function readCase(letters) {
    if (letters === letters.toLowerCase()) return LOWER;
    if (letters === letters.toUpperCase()) return UPPER;
    if (letters[0] === letters[0].toUpperCase()
        && letters.slice(1) === letters.slice(1).toLowerCase()) return TITLE;
    return -1;
}

/**
 * Put the case back on the rendered result. The tone mark is already on the vowel (Ǎ, Ǚ, Ế),
 * so all capitals is just toUpperCase; initial capital only touches the first character and
 * leaves the rest lowercase.
 * @param {string} syllable
 * @param {number} form
 * @returns {string}
 */
function applyCase(syllable, form) {
    if (form === LOWER) return syllable;
    if (form === UPPER) return syllable.toUpperCase();
    return syllable[0].toUpperCase() + syllable.slice(1);
}

/**
 * The colon marker wins over the default spelling: writing ju:1 asks for jǖ regardless of
 * context (jv:1 means the same; v is the ASCII writing of ü).
 * Letters after the colon belong to the same syllable (lu:e4 -> lüè), so the full final is
 * assembled first and then converted.
 * There are only two legal positions: right after the letter carrying the two dots, or at the
 * end of the syllable (jvan:1). Anywhere else (j:van1, jva:n1) is a mistake and is not guessed
 * at.
 *
 * When the colon lands on v (vv:1, vai:1, vu:1): v already is the ASCII writing of ü, so the
 * colon adds no information. If the first letter of that entry is still a consonant v, the
 * output goes through as usual — it is treated as "no colon written", and vv:1 comes out
 * identical to vv1.
 *
 * When the colon lands on u (uang:1, shui:3): after u becomes v, the dictionary reads v in
 * that entry as a consonant (uang -> vang -> vāng), so the output would contain a consonant v
 * the caller never wrote. That is a miss, not a conversion, and the caller gets the run back.
 *
 * The circumflex marker (e^) is a different thing: it does not pick a final, it turns e into
 * ê. ê has no u to carry the dots, so it excludes the colon; and it does not work after any
 * other letter either.
 *
 * The output spelling is decided by the token alone: a bare syllable is always standard, and
 * only a colon asks for the literal form. There is no "convert the whole run to literal"
 * switch, so literal is never threaded down the call chain — the one branch that needs the
 * literal form hardcodes true and the caller cannot change it.
 *
 * Letter case does not affect the lookup, only the output form: the dictionary is read in
 * lowercase and the original case is put back after rendering.
 * @param {string} abc
 * @param {string} hat `^` or an empty string
 * @param {string} mark
 * @param {string} after letters between the colon and the tone digit
 * @param {string} num
 * @param {boolean} strict
 * @returns {string|null}
 */
function renderToken(abc, hat, mark, after, num, strict) {
    const form = readCase(abc + after);
    if (form === -1) return null;

    // Both keys and values in the dictionary are lowercase; look up in lowercase always
    const lower = abc.toLowerCase();
    const rest = after.toLowerCase();

    if (hat === '^') {
        if (lower !== 'e' || rest !== '' || mark === ':') return null;
        const syllable = renderSyllable('e^', num, false, strict);
        return syllable === null ? null : applyCase(syllable, form);
    }

    if (mark !== ':') {
        const syllable = renderSyllable(lower, num, false, strict);
        return syllable === null ? null : applyCase(syllable, form);
    }

    const raw = lower + rest;
    const key = dottedKey(raw);
    if (key === null) return null;

    // The colon has only two legal positions: right after the letter carrying the two dots
    // (u or v), or at the very end of the syllable. The first says "these dots belong to this
    // letter" (ju:an1 / jv:an1 / lu:e4); the second is the short form (juan:1 / jv:1). Allow
    // any position and obviously misplaced runs like j:van1 and jva:n1 would also get jüān —
    // that is not leniency, it is failing to read what was written.
    if (rest !== '' && lower.length !== raw.search(/[uv]/) + 1) return null;

    const syllable = renderSyllable(key, num, true, strict);
    if (syllable === null) return null;

    // dottedKey only changes the string when it turns a u into v, so key === raw means the
    // colon landed on v. Landed on v: the colon restates the same thing, so the output goes
    // through even if that entry treats v as a consonant. Landed on u: it has to produce a
    // real ü; an ASCII v left in the result means that entry did not read the u as ü, so the
    // colon missed.
    const landedOnV = key === raw;

    if (!landedOnV && syllable.includes('v')) return null;

    return applyCase(syllable, form);
}

/**
 * Convert one token to pinyin. Three cases; everything else comes back as written:
 *
 *   1. a single syllable          ni3          -> nǐ
 *   2. several syllables, joined  ni3hao3      -> nǐhǎo
 *   3. pinyin + ASCII punctuation ni3,hao3     -> nǐ,hǎo
 *
 * The output keeps the input's separators: no spaces are added between joined syllables, the
 * spaces that were written are still there, and punctuation stays where it was. Conversion
 * touches letters and tones only; layout is not the converter's call.
 *
 * If any part is unrecognised the whole run is returned as written ("a1b2c3", "hua1r", "ma6"):
 * better to leave a token unconverted than to emit half a result — half a result is harder to
 * notice than no result.
 * @param {string} str
 * @param {boolean} strict
 * @returns {string}
 */
function convertToken(str, strict) {
    const single = regex.exec(str);

    // Single-syllable fast path: almost every input takes this branch
    if (single) {
        const { abc, hat, mark, num } = single.groups;
        return renderToken(abc, hat, mark, '', num, strict) ?? str;
    }

    let out = '';
    let pos = 0;
    let count = 0;

    for (const part of str.matchAll(segment)) {
        const gap = str.slice(pos, part.index);
        if (foreign.test(gap)) return str;

        const { abc, hat, mark, after, num } = part.groups;
        const piece = renderToken(abc, hat, mark, after, num, strict);
        if (piece === null) return str;

        out += gap + piece;

        pos = part.index + part[0].length;
        count += 1;
    }

    const tail = str.slice(pos);
    if (count === 0 || foreign.test(tail)) return str;

    return out + tail;
}

/**
 * The public options accept only strict and skip; everything else is ignored — passing the
 * wrong thing should not change the algorithm.
 * @param {{strict?: boolean}|undefined} options
 * @returns {boolean}
 */
function readStrict(options) {
    return Boolean(options && options.strict);
}

/**
 * Turn the skip option into "should this run be left alone?".
 *
 * Only a string or an array of strings is accepted; the comparison is against the **whole
 * run** and is case-sensitive. That looks blunt, but the rule can only ever match a run whose
 * text equals an entry exactly: `skip: 'M2'` cannot touch `M20`, and cannot touch `m2`.
 * That is also why the input needs no marker characters — everything to be kept is declared
 * in the options, and a backslash or a brace in the text is just text here.
 *
 * Anything unrecognised counts as not passed: like readStrict, an option should not change the
 * algorithm.
 * @param {{skip?: unknown}|undefined} options
 * @returns {((run: string) => boolean)|null}
 */
function readSkip(options) {
    const spec = options === null || options === undefined ? undefined : options.skip;

    if (typeof spec === 'string') return (run) => run === spec;

    if (Array.isArray(spec)) {
        const exact = new Set(spec.filter((item) => typeof item === 'string'));
        // An empty array (or one full of junk) counts as not passed, saving a function call
        // on every conversion
        if (exact.size === 0) return null;
        return (run) => exact.has(run);
    }

    return null;
}

/**
 * Candidate runs: consecutive letters (either case), colons, circumflexes, tone digits.
 * The neighbours must not be ASCII letters, digits or underscores (Chinese, punctuation and
 * whitespace all count as boundaries). Without that requirement the inside of an English word
 * like "abcju1" would be cut out and treated as pinyin; an underscore is a word character
 * too, so an identifier-looking run such as `ni3_hao3` stays whole.
 *
 * The run is taken whole and then handed to convertToken rather than matched syllable by
 * syllable: that way "ni3hao3" still splits, while "ju1abc" still stays whole.
 */
// ^ at the end of a character class is a literal (it only negates when it comes first).
const inlineRun = /[A-Za-z:0-5^]+/g;
const wordChar = /[A-Za-z0-9_]/;

/**
 * Mark pinyin written in ASCII with tone marks: `hao3` -> `hǎo`.
 * Pinyin mixed into Chinese is recognised too: `今天ni3hao3` -> `今天nǐhǎo`.
 *
 * The name says what the call does. The tone-mark glyphs already exist (the dictionary stores
 * only toneless forms and applyToneMark computes the four tones on the fly); this step puts
 * that glyph in place of the digit. It is not "Chinese characters to pinyin", and not
 * "classify a syllable by tone" either. Nor does it guess a tone: with no tone digit there is
 * no mark to apply, so the syllable comes out in the standard spelling (`jv` -> `jū`,
 * `ma` -> `ma`).
 *
 * Splitting does not rely on spaces: candidate runs are taken from the text first and then
 * cut into syllables at their tone digits, so both `ni3hao3` and `ni3 hao3` work, while
 * `abcju1` and `ju1abc`, glued to a word, stay as written. Non-pinyin characters (Chinese,
 * punctuation, whitespace) are copied through, and leading or trailing whitespace is not
 * trimmed for the caller — conversion touches letters and tones only, and does not take over
 * layout.
 *
 * Capitals are accepted and their form carried into the output: `Zhong1guo2` -> `Zhōngguó`,
 * `BEI3JING1` -> `BĚIJĪNG`. Mixing case inside a syllable (`hAo3`) is not something the
 * standard writes, so the run comes back as written.
 *
 * Runs that should not be converted go into the `skip` option (see its notes) — the input
 * carries no marker characters, so text containing a backslash or a brace (paths, LaTeX,
 * templates) loses nothing.
 * @param {string} text
 * @param {{strict?: boolean, skip?: unknown}} [options]
 * @returns {string}
 */
function markTones(text, options) {
    const strict = readStrict(options);
    const skip = readSkip(options);

    return text.replace(inlineRun, (run, offset) => {
        const before = offset > 0 ? text[offset - 1] : '';
        const after = offset + run.length < text.length ? text[offset + run.length] : '';

        // Run glued to a letter, digit or underscore -> part of a word, never converted
        const converted = wordChar.test(before) || wordChar.test(after)
            ? run
            : convertToken(run, strict);

        // Only ask the rule about runs that would convert: a run already left as written has
        // nothing to keep
        if (skip !== null && converted !== run && skip(run)) return run;

        return converted;
    });
}

export {markTones};
