// test/test-regex-anchoring.js
// Regression tests for the silent truncation and capitalisation drift that unanchored regular
// expressions caused.
//
// The agreement: one syllable is matched as a whole (all three casing forms are accepted,
// except mixed case inside a syllable); a token may be cut into several syllables, but if any
// part of it cannot be resolved the whole run comes back as written — never half a result.
import { expect } from 'chai';
import {markTones} from '../lib/index.js';

// ---------------------------------------------------------------- test data

// Slices cleanly, but has a piece in the middle that is not recognised (b / c are not
// syllables the current implementation knows): the whole run is abandoned
const UNSPACED_MIXED = [
    'a1b2c3',
    'a1b2c3d4',
];

// "syllable + tone + r" is not supported; the run must come back as written rather than
// swallowing the r
const LEGACY_ERHUA = [
    'hua1r',
    'wan2r',
    'ma1r',
    'hua0r',
    'hua1r5',
];

// Invalid tones: the old implementation dropped any digit from 6 upwards.
// `ma3.5` is not in here: 3 is a valid tone and the 5 after the `.` is non-pinyin text, so
// each run is handled on its own and the output is `mǎ.5` (see the note in conversions).
const INVALID_TONE = [
    'ma6',
    'ma7',
    'ma8',
    'ma9',
    'ma33',
    'ma-3',
];

// Casing: the three legal forms (lowercase, initial capital, all caps) all convert, and the
// form carries over to the output. The basis is 汉语拼音正词法基本规则 §6.3, whose own
// all-caps examples keep their tone marks (BĚIJĪNG).
const CASE_FORMS = [
    ['Hao3', 'Hǎo'],
    ['Ni3 Hao3', 'Nǐ Hǎo'],
    ['HAO3', 'HǍO'],
    ['Hua1', 'Huā'],
    ['Zhong1Guo2', 'ZhōngGuó'],
    ['Ni3hao3', 'Nǐhǎo'],
];

// Casing mixed inside one syllable: the standard has no such form (hAo3 is neither lowercase
// nor initial-capital), so it counts as unresolved. The old regex skipped the capitals and
// started matching in the middle here (Hao3 -> ǎo).
const CASE_MIXED = [
    'hAo3',
    'HaO3',
    'ZHong1guo2',
];

// Symbols next to punctuation: not pinyin, and must not be swallowed
const SYMBOLS = [
    '/',
    '--',
    '...',
];

// The colon has nowhere to land: there is no u/v in the syllable to carry the two dots
// (ma:1, ha:o3, ji:1), or the dictionary entry does not read its v as ü (shui:3 -> shvi,
// which would output the consonant v)
const COLON_NO_LANDING = [
    'ma:1',
    'ha:o3',
    'ji:1',
    'shui:3',
];

// The colon asks for ü wherever it is written, regardless of whether the initial allows it —
// non-standard syllables are output all the same
const COLON_ANY_INITIAL = [
    ['gu:1', 'gǖ'],
    ['shv:3', 'shǚ'],
    ['u:e1', 'üē'],
    ['ku:2', 'kǘ'],
];

// Unspaced input: the tone digit is a reliable separator, so it can be cut now.
// The output keeps the input's separation — no spaces are inserted between joined syllables.
const SEGMENTED = [
    ['ni3hao3', 'nǐhǎo'],
    ['hao3hao3', 'hǎohǎo'],
    ['ni3hao', 'nǐhao'],
    ['han4yu3pin1yin1', 'hànyǔpīnyīn'],
    ['ni3hao3ma5', 'nǐhǎoma'],
    ['ni3jue2', 'nǐjué'],
    ['xian4dai4hua4', 'xiàndàihuà'],
];

// Letters may follow the colon: lu:e4 is one syllable lüe plus the fourth tone, not lü + é
const COLON_MID_FINAL = [
    ['lu:e4', 'lüè'],
    ['nu:e4', 'nüè'],
    ['lu:e', 'lüe'],
    ['jue2 jve:2 lve4', 'jué jüé lüè'],
];

// Punctuation no longer blocks conversion; it stays where it is
const PUNCT_BOUND = [
    ['hao3!', 'hǎo!'],
    ['ni3,', 'nǐ,'],
    ['hao3.', 'hǎo.'],
    ['hao3?', 'hǎo?'],
    ['hao3;', 'hǎo;'],
    ['hao3:', 'hǎo:'],
    ['“hao3”', '“hǎo”'],
    ['(hao3)', '(hǎo)'],
    ['[hao3]', '[hǎo]'],
    ['hao3…', 'hǎo…'],
    ['hao3—', 'hǎo—'],
    ['ni3,hao3', 'nǐ,hǎo'],
    ['ni3/hao3', 'nǐ/hǎo'],
    ['na3-li3', 'nǎ-lǐ'],
];

// Input that is not pinyin at all
const NOT_PINYIN = [
    '123',
    '1',
    '😀3',
    'Ω1',
    'ａ1',        // full-width letter
    '我3',        // Chinese character mixed in
    '日本語',
    'bpmf',
    'r',
    'ü',
    'nǐ hǎo',     // already toned
];

// Whitespace: whitespace inside a token can now be crossed too, and no space is added between
// syllables (the existing whitespace already separates them)
const WHITESPACE = [
    ['ni3\nhao3', 'nǐ\nhǎo'],
    ['ni3\thao3', 'nǐ\thǎo'],
    ['ni3\thao3\two3', 'nǐ\thǎo\twǒ'],
];

const passThrough = [
    // No tone digit to cut at: there is no separation information inside hanyu
    ['hanyu3pin1yin1', 'unspaced'],
    ...UNSPACED_MIXED.map((s) => [s, 'unspaced mixed']),
    ...LEGACY_ERHUA.map((s) => [s, 'legacy erhua']),
    ...INVALID_TONE.map((s) => [s, 'invalid tone']),
    ...CASE_MIXED.map((s) => [s, 'mixed case']),
    ...SYMBOLS.map((s) => [s, 'symbols']),
    ...COLON_NO_LANDING.map((s) => [s, 'colon has no landing']),
    ...NOT_PINYIN.map((s) => [s, 'not pinyin']),
];

// Legal input must keep converting correctly (so that fixing the regex does not break it)
const conversions = [
    // casing
    ...CASE_FORMS,
    // basics
    ['ni3 hao3', 'nǐ hǎo'],
    ['chu1 yin1 wei4 lai2', 'chū yīn wèi lái'],
    ['xun2 yin1 liu2 ge1', 'xún yīn liú gē'],
    ['han4 yu3 pin1 yin1 fang1 an4', 'hàn yǔ pīn yīn fāng àn'],
    ['zhuang4 tai4', 'zhuàng tài'],
    ['wo3 ai4 ni3', 'wǒ ài nǐ'],
    ['zhe4 yang4', 'zhè yàng'],
    ['zhong1 guo2 ren2', 'zhōng guó rén'],
    // initials / finals on their own
    ['b p m f', 'b p m f'],
    ['zh ch sh r', 'zh ch sh r'],
    ['an1 vn2 ong3 uen4', 'ān ǘn ǒng uèn'],
    ['iou1 uen4', 'iōu uèn'],
    ['v', 'ü'],
    ['ng', 'ng'],
    // erhua
    ['huar1', 'huār'],
    ['renr2', 'rénr'],
    ['shuir3', 'shuǐr'],
    ['yuer4', 'yuèr'],
    ['banr2', 'bánr'],
    ['dianr1', 'diānr'],
    ['haor3', 'hǎor'],
    ['niaor3', 'niǎor'],
    ['zher4', 'zhèr'],
    ['huar', 'huar'],
    ['huar5', 'huar'],
    // ü
    ['nv3', 'nǚ'],
    ['lv2', 'lǘ'],
    ['lve4', 'lüè'],
    ['nve4', 'nüè'],
    ['jue2', 'jué'],
    ['xue3', 'xuě'],
    ['yun2', 'yún'],
    ['yuan2', 'yuán'],
    ['jun1', 'jūn'],
    ['qun2', 'qún'],
    ['xun4', 'xùn'],
    // neutral tone / no tone
    ['ma', 'ma'],
    ['ma0', 'ma'],
    ['ma5', 'ma'],
    ['ma4', 'mà'],
    ['zi5', 'zi'],
    ['lo5', 'lo'],
    ['er', 'er'],
    ['er2', 'ér'],
    ['er4', 'èr'],
    // the four tones
    ['ma1', 'mā'],
    ['ma2', 'má'],
    ['ma3', 'mǎ'],
    // others
    ['shui3', 'shuǐ'],
    ['dui4', 'duì'],
    ['gun3', 'gǔn'],
    ['shi2', 'shí'],
    ['ri4', 'rì'],
    ['ci2', 'cí'],
    ['si1', 'sī'],
    ['zhi1', 'zhī'],
    ['chi1', 'chī'],
    ['weng1', 'wēng'],
    ['yong3', 'yǒng'],
    ['xiong2', 'xióng'],
    ['jiong3', 'jiǒng'],
    ['yo1', 'yō'],
    ['bong1 tv2 pe3 wir4', 'bōng tǘ pě wìr'],   // non-standard combinations in the dictionary
    ['liou2 yuen2', 'lióu yuén'],                // a deliberate difference from 2.x (the v1 implementation)
    // leading and trailing whitespace is no longer trimmed: conversion only touches letters
    // and tone marks, layout is the caller's business
    ['  ni3 hao3  ', '  nǐ hǎo  '],
    ['ni3 hao3 ', 'nǐ hǎo '],
    ['ni3  hao3', 'nǐ  hǎo'],
    ['', ''],
    // each run on its own: ma3 is a complete syllable and `.5` is non-pinyin text, so only
    // the former converts
    ['ma3.5', 'mǎ.5'],
    // unspaced, punctuation, whitespace
    ...SEGMENTED,
    ...COLON_MID_FINAL,
    ...COLON_ANY_INITIAL,
    ...PUNCT_BOUND,
    ...WHITESPACE,
];

// Mixed sentences: the legal parts convert, the illegal ones do not move at all.
// Punctuation touching pinyin no longer blocks conversion, but the punctuation itself is kept
// as written (it is no longer swallowed).
const mixedSentences = [
    ['ni3 hao3! wo3', 'nǐ hǎo! wǒ'],
    ['wo3 ai4 ni3!', 'wǒ ài nǐ!'],
    ['ni3hao3 wo3 hen3 hao3', 'nǐhǎo wǒ hěn hǎo'],
    ['Hao3 ma5?', 'Hǎo ma?'],
    ['zhong1 guo2 123 ren2', 'zhōng guó 123 rén'],
    ['han4 yu3, pin1 yin1.', 'hàn yǔ, pīn yīn.'],
    ['ni3 hao3 ! wo3', 'nǐ hǎo ! wǒ'],
    ['ni3hao3.hao3hao3', 'nǐhǎo.hǎohǎo'],
    ['ni3我', 'nǐ我'],
];

// Initials and finals used by the full-table sweep
const SWEEP_INITIALS = ['', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
    'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
const SWEEP_FINALS = ['a', 'o', 'e', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong',
    'i', 'ia', 'ie', 'iao', 'iu', 'ian', 'in', 'iang', 'ing', 'iong',
    'u', 'ua', 'uo', 'uai', 'ui', 'uan', 'un', 'uang',
    'v', 've', 'van', 'vn', 'er'];
const SWEEP_TONES = ['', '0', '1', '2', '3', '4', '5'];

// ---------------------------------------------------------------- helpers

const TONE_MARKS = '\u0304\u0301\u030C\u0300';

/** The letter sequence left after dropping tone marks, digits, punctuation, casing and the v/u difference */
function lettersOf(s) {
    return s
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^A-Za-z]/g, '')
        .toLowerCase()
        .replace(/v/g, 'u');
}

/**
 * Assert that conversion lost nothing: every letter in the input must appear in the output,
 * in the same order. Two differences are ignored: tone digits are consumed (they became
 * marks), and v and u are the two ASCII spellings of ü.
 *
 * This also rules out a half-conversion: ni3hao3 -> nǐ would make the three letters of hao
 * disappear, and cutting one time too many would put the letters out of order — as it stands
 * lu:e4 -> lüè, where the letters after the colon are part of the same syllable.
 */
function expectNoLoss(input, output, label) {
    expect(lettersOf(output), `${label}: letters lost or reordered`).to.equal(lettersOf(input));
}

/** Count the tone marks in a token */
function toneMarkCount(token) {
    return [...token.normalize('NFD')].filter((c) => TONE_MARKS.includes(c)).length;
}

/** Deterministic pseudo-random, so fuzz runs are reproducible */
function makeRandom(seed) {
    let s = seed >>> 0;
    return () => {
        s ^= s << 13; s >>>= 0;
        s ^= s >>> 17;
        s ^= s << 5; s >>>= 0;
        return s / 0x100000000;
    };
}

// ---------------------------------------------------------------- cases

// The 35 entries in passThrough are split into two groups by why they cannot convert. Both
// groups assert the same thing (output === input) but for different reasons: this group would
// lose letters if cut, the next one is not pinyin at all. Running them together twice would
// look like 82 separate cases when it is really the same data twice (35 x 2).
const TRUNCATION_KINDS = new Set(['unspaced', 'unspaced mixed', 'legacy erhua', 'invalid tone']);
const NOT_PINYIN_KINDS = new Set(['mixed case', 'symbols', 'colon has no landing', 'not pinyin']);

describe('regex anchoring: input that would lose letters if cut comes back as written', () => {
    for (const [input, kind] of passThrough.filter(([, k]) => TRUNCATION_KINDS.has(k))) {
        it(`[${kind}] ${JSON.stringify(input)}`, () => {
            expect(markTones(input)).to.equal(input);
        });
    }
});

describe('regex anchoring: punctuation no longer blocks conversion', () => {
    // The old behaviour swallowed the punctuation and converted anyway ('hao3!' -> 'hǎo'),
    // at the cost of losing information. An earlier version then refused to touch any token
    // with punctuation in it, which broke 'ni3,hao3' as a whole. Now punctuation is only a
    // syllable boundary and stays where it is.
    it('a token with trailing punctuation converts and keeps its punctuation', () => {
        expect(markTones('hao3!')).to.equal('hǎo!');
        expect(markTones('ni3, hao3')).to.equal('nǐ, hǎo');
        expect(markTones('hao3. hao3')).to.equal('hǎo. hǎo');
    });

    it('punctuation on its own as a token is unaffected', () => {
        expect(markTones('ni3 hao3 !')).to.equal('nǐ hǎo !');
    });
});

describe('regex anchoring: legal pinyin still converts', () => {
    for (const [input, expected] of conversions) {
        it(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
            expect(markTones(input)).to.equal(expected);
        });
    }
});

describe('regex anchoring: legal and illegal tokens in one sentence', () => {
    for (const [input, expected] of mixedSentences) {
        it(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
            expect(markTones(input)).to.equal(expected);
        });
    }
});

describe('regex anchoring: input that is not pinyin does not move', () => {
    for (const [input, kind] of passThrough.filter(([, k]) => NOT_PINYIN_KINDS.has(k))) {
        it(`[${kind}] ${JSON.stringify(input)}`, () => {
            expect(markTones(input)).to.equal(input);
        });
    }

    // The two describes above select by kind label. A new entry added without a label would
    // appear in neither of them; an entry filed wrongly would run twice.
    // This assertion catches both.
    it('the two label sets are disjoint and cover every entry in passThrough', () => {
        const both = passThrough.filter(
            ([, kind]) => TRUNCATION_KINDS.has(kind) && NOT_PINYIN_KINDS.has(kind),
        );
        expect(both).to.deep.equal([]);

        const covered = passThrough.filter(
            ([, kind]) => TRUNCATION_KINDS.has(kind) || NOT_PINYIN_KINDS.has(kind),
        );
        expect(covered).to.have.length(passThrough.length);
    });
});

describe('regex anchoring: output invariants', () => {
    const allInputs = [
        ...passThrough.map(([s]) => s),
        ...conversions.map(([s]) => s),
        ...mixedSentences.map(([s]) => s),
        'ni3hao3 hao3! Hao3 ma5...',
        '  ',
        '   ni3   hao3   ',
    ];

    it('no input throws', () => {
        for (const s of allInputs) {
            expect(() => markTones(s), `input ${JSON.stringify(s)}`).to.not.throw();
        }
    });

    it('idempotent: markTones(markTones(x)) === markTones(x)', () => {
        for (const s of allInputs) {
            const once = markTones(s);
            expect(markTones(once), `input ${JSON.stringify(s)}`).to.equal(once);
        }
    });

    it('no letters lost: the output has the same letter sequence as the input', () => {
        for (const s of allInputs) {
            expectNoLoss(s, markTones(s), JSON.stringify(s));
        }
    });

    it('no tone marks appear from nowhere: never more of them than there are digits', () => {
        const bad = [];
        for (const s of allInputs) {
            const out = markTones(s);
            // Input returned as written (already toned, or mixed case) is left out of this count
            if (out === s) continue;

            const digits = (s.match(/[0-9]/g) ?? []).length;
            const marks = toneMarkCount(out);
            if (marks > digits) {
                bad.push(`${JSON.stringify(s)} -> ${JSON.stringify(out)} (${marks} marks / ${digits} digits)`);
            }
        }
        expect(bad).to.deep.equal([]);
    });
});

describe('regex anchoring: full syllable-table sweep', () => {
    it('neutral-tone erhua: a final plus r0 converts too', () => {
        // Erhua takes no tone mark in the neutral tone, but the r has to stay in the output —
        // the 2.x implementation used to return ar0 as written.
        expect(markTones('ar0')).to.equal('ar');
        expect(markTones('bair0')).to.equal('bair');
        expect(markTones('huar0')).to.equal('huar');
        expect(markTones('vr0')).to.equal('ür');
    });

    it('across the whole table there is no undefined, no empty string, no lost letters', () => {
        for (const ini of SWEEP_INITIALS) {
            for (const fin of SWEEP_FINALS) {
                for (const t of SWEEP_TONES) {
                    const input = ini + fin + t;
                    const out = markTones(input);
                    expect(typeof out, input).to.equal('string');
                    expectNoLoss(input, out, input);
                }
            }
        }
    });
});

describe('regex anchoring: random fuzz', () => {
    const ALPHABET = (
        'abcdefghijklmnopqrstuvwxyz' +
        'ABHNZ' +
        '0123456789' +
        ' !?.,' +
        ':-/()' +
        '“”…中文😀Ωüé'
    ).split('');

    it('600 random strings: nothing throws, idempotent, no letters lost', () => {
        const rand = makeRandom(20261018);
        const failures = [];

        for (let n = 0; n < 600; n++) {
            const len = Math.floor(rand() * 12);
            let s = '';
            for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(rand() * ALPHABET.length)];

            try {
                const out = markTones(s);
                expectNoLoss(s, out, `fuzz #${n} ${JSON.stringify(s)}`);

                // Idempotence only holds when the first output is still pure ASCII.
                // As soon as the output contains ü or a tone mark, the string is outside the
                // input alphabet: by the input contract it is ASCII pinyin, so after
                // `vv` -> `vü` that v would be read again (a lone v is a syllable, i.e. ü) and
                // the second pass is looking at a different language.
                // ASCII output can only come from "no tone written" or "neutral tone", where
                // conversion did not actually change the letters — that is when idempotence is
                // a claim worth making.
                if (!/[^\x00-\x7F]/.test(out) && markTones(out) !== out) {
                    failures.push(`${JSON.stringify(s)}: not idempotent -> ${JSON.stringify(out)}`);
                }
            } catch (err) {
                failures.push(`${JSON.stringify(s)}: ${err.message}`);
            }
        }

        expect(failures).to.deep.equal([]);
    });
});
