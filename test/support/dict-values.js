// test/support/dict-values.js
// lib/dict.js stores only the **toneless form** of each syllable; lib/index.js adds the four
// tones at run time. The tests need an independent source of expected values, so tone marking
// is implemented a second time here:
//
//   production code: an indexOf loop looking for a / o / e / ê in turn, then a backwards scan
//                    of i/u/ü, and finally a closed table of nasals, falling back to a rule
//                    that marks the last nasal.
//   here:            three regexes, picking the main vowel / last nasal by position scan plus
//                    a negative lookahead, with the nasal table copied out separately to take
//                    priority.
//
// Two different writings of the same rule, which is what makes the cross-check meaningful.
// The rule itself is the one in 汉语拼音方案: a takes the mark, else o, else e, otherwise the
// last vowel. ê is a case of its own — it is not e, it already carries a circumflex, and the
// tone mark goes on top of the circumflex (ế). An interjection syllable with no vowel at all
// is marked on the last nasal (m3 -> m̌, hng2 -> hńg).
import dict from '../../lib/dict.js';

// Index with an array: when a marked glyph is two code points ("letter + combining mark"),
// indexing the string by position would pick up half a character.
const MARKS = {
    a: ['ā', 'á', 'ǎ', 'à'],
    o: ['ō', 'ó', 'ǒ', 'ò'],
    e: ['ē', 'é', 'ě', 'è'],
    i: ['ī', 'í', 'ǐ', 'ì'],
    u: ['ū', 'ú', 'ǔ', 'ù'],
    'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    'ê': ['ê\u0304', 'ế', 'ê\u030c', 'ề'],
    m: ['m\u0304', 'ḿ', 'm\u030c', 'm\u0300'],
    n: ['n\u0304', 'ń', 'ň', 'ǹ'],
};

// Try a/o/e/ê first; otherwise take the i/u/ü that has no vowel after it — the last vowel.
// iu -> u and ui -> i fall out of "no vowel after it" automatically.
const MAIN_VOWEL = /a|o|e|ê|[iuü](?![aoeiuüê])/;

// With no vowel at all, take the m/n that has no m/n after it — the last nasal.
// hng -> mark the n (hńg), hm -> mark the m (hḿ), ng -> mark the n (ńg).
const LAST_NASAL = /[mn](?![a-z]*[mn])/;

// The toned interjection forms that really occur in the dictionary, taking priority over the
// rule. The glyphs are copied independently of NASAL_TONES in lib/index.js, so if the two
// disagree someone has changed one of them by mistake.
// m has no third tone, n and ng have no first tone, and hm / hng exist only without a tone —
// the rule fills those cells in.
const NASAL_TONES = {
    m: {1: 'm\u0304', 2: 'ḿ', 4: 'm\u0300'},
    n: {2: 'ń', 3: 'ň', 4: 'ǹ'},
    ng: {2: 'ńg', 3: 'ňg', 4: 'ǹg'},
    hm: {},
    hng: {},
};

/** The toneless form from the dictionary; throws if the key is missing (a typo in a test should fail at once) */
function baseOf(key) {
    const base = dict[key];
    if (base === undefined) throw new Error(`no such key in dict: ${key}`);
    return base;
}

/**
 * Put tone number `tone` on a toneless form (0 is the neutral tone and adds no mark).
 *
 * A syllable whose mark cannot be worked out returns `input` — the original input the caller
 * passed in, defaulting to `key + tone`. That way the "expected value" is always an output
 * that can be compared to a string directly, with no null checks scattered around call sites.
 */
export function expectedValue(key, tone, input = key + tone) {
    const base = baseOf(key);
    if (tone === 0) return base;

    const match = MAIN_VOWEL.exec(base) || LAST_NASAL.exec(base);
    if (!match) return input;

    const listed = NASAL_TONES[base]?.[tone];
    if (listed) return listed;

    const at = match.index;
    return base.slice(0, at) + MARKS[base[at]][tone - 1] + base.slice(at + 1);
}
