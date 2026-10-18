// test/test-two-spellings.js
// The two spellings of j/q/x/y + ü (standard ju, literal jv), as they differ in the output.
//
// The agreement:
//   There is one default output — the national-standard form, with ü after j/q/x/y written
//   without its dots (jv1 -> jū). The literal form is not a global option; it appears only
//   where a colon was written (ju:1 -> jǖ). The colon is written on the u, because u is the
//   letter that would carry the dots; jv: is a synonymous spelling, not a mistake. So "both
//   spellings side by side on one line" needs no extra switch.
//
// Method: the implementation converts by swapping dictionary keys, while the tests work out
// their expected values independently, by replacing characters. Two different paths, which
// is what makes the cross-check worth anything.
import { expect } from 'chai';
import {markTones} from '../lib/index.js';
import dict from '../lib/dict.js';
import { expectedValue } from './support/dict-values.js';

// ------------------------------------------------------------ closed allow-list

const HEADS = ['j', 'q', 'x', 'y'];
const FINALS = ['v', 've', 'van', 'vn', 'vr', 'ver', 'vanr', 'vnr'];

// Literal spellings: jv jve jvan jvn + erhua, 32 in all
const LITERAL_KEYS = HEADS.flatMap((h) => FINALS.map((f) => h + f));
// The matching standard spellings: ju jue juan jun + erhua
const CANONICAL_KEYS = LITERAL_KEYS.map((k) => k.replace('v', 'u'));

const TONES = [0, 1, 2, 3, 4];

// ------------------------------------------- independent: add and remove dots by character

const DOT = { u: 'ü', 'ū': 'ǖ', 'ú': 'ǘ', 'ǔ': 'ǚ', 'ù': 'ǜ' };
const UNDOT = { 'ü': 'u', 'ǖ': 'ū', 'ǘ': 'ú', 'ǚ': 'ǔ', 'ǜ': 'ù' };

function withDots(syllable) {
    return syllable[0] + (DOT[syllable[1]] ?? syllable[1]) + syllable.slice(2);
}

function withoutDots(syllable) {
    return syllable[0] + (UNDOT[syllable[1]] ?? syllable[1]) + syllable.slice(2);
}

/** Add the dots to a standard value from the dictionary (only on the first vowel after the initial) */
function canonicalValueDotted(abbr, tone) {
    return withDots(expectedValue(abbr, tone));
}

// ---------------------------------------------------------------- default behaviour

describe('two spellings: the default output is the standard form', () => {
    it('literal input converts to the standard form by default', () => {
        expect(markTones('jv1')).to.equal('jū');
        expect(markTones('jve2')).to.equal('jué');
        expect(markTones('jvan1')).to.equal('juān');
        expect(markTones('jvn4')).to.equal('jùn');
    });

    it('standard input is left as it is', () => {
        expect(markTones('ju1')).to.equal('jū');
        expect(markTones('jue2')).to.equal('jué');
        expect(markTones('juan1')).to.equal('juān');
        expect(markTones('jun4')).to.equal('jùn');
    });

    it('all 32 literal keys convert to the standard form', () => {
        expect(LITERAL_KEYS).to.have.length(32);
        for (const literal of LITERAL_KEYS) {
            const canonical = literal.replace('v', 'u');
            for (const tone of TONES) {
                expect(markTones(literal + tone)).to.equal(expectedValue(canonical, tone));
            }
        }
    });

    it('a standard key matches the dictionary value, one by one', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                expect(markTones(canonical + tone)).to.equal(expectedValue(canonical, tone));
            }
        }
    });

    it('the default output contains no ü (32 allow-listed keys x 5 tones)', () => {
        for (const literal of LITERAL_KEYS) {
            for (const tone of TONES) {
                expect(markTones(literal + tone)).to.not.match(/[üǖǘǚǜ]/);
            }
        }
    });
});

// ---------------------------------------------------------------- the colon asks for the literal form

describe('two spellings: a colon means the dots on the u', () => {
    it('one colon changes the spelling and nothing else', () => {
        expect(markTones('ju1 ju:1')).to.equal('jū jǖ');
        expect(markTones('juan1 juan:1')).to.equal('juān jüān');
    });

    it('all 32 standard keys can be asked for their literal form with a colon', () => {
        for (const canonical of CANONICAL_KEYS) {
            const literal = canonical.replace('u', 'v');
            for (const tone of TONES) {
                expect(markTones(canonical + ':' + tone)).to.equal(expectedValue(literal, tone));
            }
        }
    });

    it('the literal form minus its dots equals the standard form (32 keys x 5 tones)', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                const literal = markTones(canonical + ':' + tone);
                expect(literal).to.match(/[üǖǘǚǜ]/);
                expect(withoutDots(literal)).to.equal(markTones(canonical + tone));
            }
        }
    });

    it('a colon on v is the same as a colon on u (32 keys x 5 tones)', () => {
        // The standard spelling is u:; v is already the ASCII spelling of ü, so jv: is a
        // synonymous input for the same request
        for (const literal of LITERAL_KEYS) {
            const canonical = literal.replace('v', 'u');
            for (const tone of TONES) {
                const viaU = markTones(canonical + ':' + tone);
                const viaV = markTones(literal + ':' + tone);
                expect(viaV, literal + ':' + tone).to.equal(viaU);
                expect(viaV).to.equal(expectedValue(literal, tone));
            }
        }
    });

    it('v: and u: are equivalent after n/l too', () => {
        expect(markTones('nv:3')).to.equal('nǚ');
        expect(markTones('nu:3')).to.equal('nǚ');
        expect(markTones('lv:4')).to.equal('lǜ');
        expect(markTones('nv:3 nvn:4')).to.equal('nǚ nǜn');
    });

    it('a colon with no initial is just u:', () => {
        expect(markTones('v:')).to.equal('ü');
        expect(markTones('u:')).to.equal('ü');
        expect(markTones('v:1')).to.equal('ǖ');
        expect(markTones('v:4')).to.equal('ǜ');
    });

    it('the colon asks for ü wherever it is written, regardless of the initial', () => {
        // Non-standard syllables are honoured too: this package outputs standard spellings
        // and non-standard ones alike
        expect(markTones('gu:1')).to.equal('gǖ');
        expect(markTones('gv:1')).to.equal('gǖ');
        expect(markTones('shv:3')).to.equal('shǚ');
        expect(markTones('u:e1')).to.equal('üē');
    });

    it('the colon has exactly two positions: after the letter it lands on, or at the end', () => {
        // After the landing point — the colon claims these two dots belong to the u/v right
        // before it, and the letters after it are still the same final
        expect(markTones('ju:an1')).to.equal('jüān');
        expect(markTones('jv:an1')).to.equal('jüān');
        expect(markTones('lu:e4')).to.equal('lüè');

        // At the end of the syllable — the shorthand, where the colon may sit several
        // letters away from the u/v it belongs to
        expect(markTones('juan:1')).to.equal('jüān');
        expect(markTones('jvan:1')).to.equal('jüān');

        // Both positions ask for the same thing
        expect(markTones('jv:an1')).to.equal(markTones('jvan:1'));

        // Any other position is not guessed: the colon is neither after the landing point
        // nor at the end, so the run comes back as written.
        // These used to convert (j:van1 -> jüān); once the rule was tightened they count as
        // written wrong.
        for (const input of ['j:van1', 'j:uan1', 'jva:n1', 'jua:n1', 'n:ue4', 'l:ve4']) {
            expect(markTones(input), input).to.equal(input);
        }
    });

    it('a colon on a v that is not ü here gives the same output as writing the key bare', () => {
        // The dictionary values for these three keys are v-a-i / v-ü / v-u: the v the colon
        // lands on is a consonant, so the colon cannot change it.
        // A colon does not create a "failure" state: if it cannot change anything, the key is
        // printed with the spelling it already has, so a colon on a v only says the same thing
        // twice — vv:1 is vv1.
        expect(markTones('vai:1')).to.equal(markTones('vai1'));
        expect(markTones('vv:1')).to.equal(markTones('vv1'));
        expect(markTones('vu:1')).to.equal(markTones('vu1'));

        expect(markTones('vai:1')).to.equal('vāi');
        expect(markTones('vv:1')).to.equal('vǖ');
        expect(markTones('vu:1')).to.equal('vū');
    });

    it('the eight half-dotted values are likewise synonyms of the bare key', () => {
        // These eight keys have values like vü / vüe / vüan / vün: the second v has already
        // become ü, so a colon on the first v cannot change anything and the output is
        // character-for-character the bare key.
        const halfDotted = ['vv', 'vve', 'vvan', 'vvn', 'vvr', 'vver', 'vvanr', 'vvnr'];
        for (const key of halfDotted) {
            expect(markTones(key + ':1'), key).to.equal(markTones(key + '1'));
        }

        // Under strict these keys are not words at all and each comes back as written — and
        // "as written" keeps the colon the caller typed, the same way jui:1 is handled; this
        // rule does not strip it.
        expect(markTones('vv1', {strict: true})).to.equal('vv1');
        expect(markTones('vv:1', {strict: true})).to.equal('vv:1');
    });

    it('the colon differs from the standard value by exactly the dots', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                expect(markTones(canonical + ':' + tone))
                    .to.equal(canonicalValueDotted(canonical, tone));
            }
        }
    });
});

// ---------------------------------------------------------------- not out of bounds

describe('two spellings: conversion never goes past the allow-list', () => {
    it('ü after n/l keeps its dots (it never loses them anyway)', () => {
        const nlKeys = ['nv', 'nve', 'nvan', 'nvn', 'nvr', 'nver', 'nvanr', 'nvnr',
                        'lv', 'lve', 'lvan', 'lvn', 'lvr', 'lver', 'lvanr', 'lvnr'];
        expect(nlKeys).to.have.length(16);
        for (const key of nlKeys) {
            for (const tone of TONES) {
                expect(markTones(key + tone)).to.equal(expectedValue(key, tone));
            }
        }
    });

    it('the u form after n/l is not taken for ü (nu != nv)', () => {
        for (const key of ['nu', 'nue', 'nuan', 'nun', 'lu', 'lue', 'luan', 'lun']) {
            for (const tone of TONES) {
                expect(markTones(key + tone)).to.equal(expectedValue(key, tone));
            }
        }
    });

    it('fake syllables such as jui/jua/juo are not taken for jü', () => {
        const fakes = Object.keys(dict).filter(
            (k) => /^[jqxy]u/.test(k) && !CANONICAL_KEYS.includes(k)
        );
        expect(fakes.length).to.be.greaterThan(0);
        for (const key of fakes) {
            for (const tone of TONES) {
                expect(markTones(key + tone)).to.equal(expectedValue(key, tone));
            }
        }
    });

    it('full-table scan: outside the allow-list every value matches the dictionary', () => {
        // Every key in the dictionary can be hit by the input syntax (plain lowercase
        // letters, or e^), so the whole table gets scanned.
        const allowedToChange = new Set([...LITERAL_KEYS, ...CANONICAL_KEYS]);
        for (const key of Object.keys(dict)) {
            if (allowedToChange.has(key)) continue;
            for (const tone of TONES) {
                expect(markTones(key + tone), key + tone).to.equal(expectedValue(key, tone));
            }
        }
    });
});

// ---------------------------------------------------------------- no global switch
// The spelling does not vary with the options. The only thing that affects it is the colon a
// token writes itself — strict only decides whether a syllable is accepted, skip only decides
// whether a run is touched, and neither changes the spelling.

describe('two spellings: a token outputs the same regardless of context', () => {
    // A token decides its own spelling, so it should come out the same at the start of a
    // sentence, at the end, in the middle, and on its own. That is a stronger claim than
    // "the whole-run result equals the per-call results joined together": that one would
    // compare an implementation only against itself. Here it is the same token in four
    // positions.
    it('32 literal keys + 32 standard keys x 5 tones, identical in four positions', () => {
        for (const key of [...LITERAL_KEYS, ...CANONICAL_KEYS]) {
            for (const tone of TONES) {
                const input = key + tone;
                const alone = markTones(input);
                expect(markTones(`${input} ni3`), input).to.equal(`${alone} nǐ`);
                expect(markTones(`ni3 ${input}`), input).to.equal(`nǐ ${alone}`);
                expect(markTones(`ni3 ${input} hao3`), input).to.equal(`nǐ ${alone} hǎo`);
            }
        }
    });
});

// ---------------------------------------------------------------- decided per token
// A token decides its own spelling, independent of how many tokens there are and how many
// calls were made — standard and literal spellings can sit side by side in one string.

describe('two spellings: decided per token', () => {
    it('a multi-syllable sentence keeps each token inside its own boundary', () => {
        expect(markTones('jv1 nv3 jvan2')).to.equal('jū nǚ juán');
        expect(markTones('jv1 nv3 jvan:2')).to.equal('jū nǚ jüán');
    });

    it('a non-pinyin token stays where it is and does not affect its neighbours', () => {
        expect(markTones('jv1 hello 123 ju:1')).to.equal('jū hello 123 jǖ');
    });
});
