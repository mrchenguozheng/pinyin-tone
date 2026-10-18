// test/test-mixed.js
// Converting whole sentences where Chinese and pinyin are mixed, and the colon notation for
// the two dots over ü.
//
// There is one entry point: candidate runs are scanned out of the text, and only runs that
// resolve are replaced; every other character (Chinese, punctuation, whitespace) is copied
// through.
//
// Two kinds of marker:
//   bare ju1 / jv1  -> standard form jū
//   ju:1            -> the colon stands for the two dots over u, giving jǖ
// The colon ignores whether the initial allows ü: gu:1 gives gǖ and u:e1 gives üē. Only three
// cases miss — no u/v in the syllable, the colon landing on a u whose v the dictionary reads
// as a consonant, and a colon in neither of the two legal positions.
// (Which keys the colon can land on is swept by test-two-spellings.js over 32 keys x 5 tones;
// this file only tests whole sentences.)
import { expect } from 'chai';
import {markTones} from '../lib/index.js';
import dict from '../lib/dict.js';

const TONES = [0, 1, 2, 3, 4];

/** Keep only Han characters, to check that non-pinyin content was not touched */
const hanOnly = (s) => s.replace(/[^\u4e00-\u9fff]/g, '');

describe('mixed text: only pinyin runs are replaced', () => {
    describe('core case: two spellings side by side in one sentence', () => {
        const input = 'ju是规范写法，而ju:1是不规范写法，因为u:1在j后面要省略上面的两点';
        const output = 'ju是规范写法，而jǖ是不规范写法，因为ǖ在j后面要省略上面的两点';

        it('a bare syllable stays standard, a colon gives the literal form', () => {
            expect(markTones(input)).to.equal(output);
        });

        it('Chinese and punctuation are copied through', () => {
            expect(hanOnly(markTones(input))).to.equal(hanOnly(input));
        });

        it('a second pass over the output changes nothing (idempotent)', () => {
            const once = markTones(input);
            expect(markTones(once)).to.equal(once);
        });
    });

    // The default form of a bare syllable (32 literal keys + 32 standard keys x 5 tones), where
    // the colon lands and in which positions, and the dots after n/l are covered cell by cell in
    // test-two-spellings.js — the same inputs are not copied again here.
    describe('boundaries: non-pinyin content is left alone', () => {
        it('English words are kept as written', () => {
            expect(markTones('hello world')).to.equal('hello world');
        });

        it('pinyin right after an English word still converts', () => {
            expect(markTones('hello jv1')).to.equal('hello jū');
        });

        it('no split when an ASCII letter precedes (abcju1)', () => {
            expect(markTones('abcju1')).to.equal('abcju1');
        });

        it('no split when an ASCII letter follows (jv1abc)', () => {
            expect(markTones('jv1abc')).to.equal('jv1abc');
            expect(markTones('ju1x')).to.equal('ju1x');
        });

        it('underscores and digits count as word characters: identifier-like runs stay put', () => {
            expect(markTones('abc_ju1')).to.equal('abc_ju1');
            expect(markTones('ni3_hao3')).to.equal('ni3_hao3');
            expect(markTones('3ju1')).to.equal('3ju1');
        });

        it('tones 6-9 are not converted', () => {
            expect(markTones('ma6 ma9')).to.equal('ma6 ma9');
            // 6 is not in the run character set, so it is a boundary in its own right; ni3 is
            // glued to its left (a digit is a word character), so no part of the run moves.
            // That is a direct consequence of "characters are never eaten", not a special case.
            expect(markTones('ni3ma6')).to.equal('ni3ma6');
        });

        it('a lone letter is not treated as pinyin', () => {
            expect(markTones('在j后面')).to.equal('在j后面');
        });

        it('brackets, quotes and punctuation all work as boundaries', () => {
            expect(markTones('（jv1）「ju1」,jv1.')).to.equal('（jū）「jū」,jū.');
        });

        it('an empty string and pure Chinese are unchanged', () => {
            expect(markTones('')).to.equal('');
            expect(markTones('汉语拼音')).to.equal('汉语拼音');
        });
    });

    // The per-tone values of the 32 jqxy+ü literal keys are covered by test-two-spellings.js;
    // the only question here is whether adding Chinese around a run changes that run's result.
    describe('mixed text does not change a run own result', () => {
        it('whole-table sweep: Chinese before and after does not change the run result', () => {
            // Every dictionary key is reachable by the input syntax (plain lowercase letters,
            // or e^), so the whole table can be swept.
            for (const key of Object.keys(dict)) {
                for (const tone of TONES) {
                    const input = key + tone;
                    expect(markTones(`前缀${input}后缀`), input)
                        .to.equal(`前缀${markTones(input)}后缀`);
                }
            }
        });
    });
});
