// test/test-segmentation.js
// Three things about splitting joined input that test-regex-anchoring.js cannot express:
//   1. Joined and separated forms are equivalent — a full cartesian sweep, not a sample
//   2. A run with no tone digit anywhere comes back as written, with no guessing at syllable
//      boundaries
//   3. The colon works inside a joined run too (the other file only tests it on a whole token)
//
// The remaining rules are pinned down in test-regex-anchoring.js: punctuation as a boundary,
// whitespace, letter case, illegal tones, erhua, where the colon lands. The same inputs are
// not copied a second time here.
import { expect } from 'chai';
import {markTones} from '../lib/index.js';

describe('splitting: joined equals separated', () => {
    // ng is the only key with no final (all 5 cells are ng), and it cannot be cut out of a
    // stream of letters, so it is not in this group — it is part of the known limitation
    // "nothing to cut at without a digit".
    const SYLLABLES = [
        'ni3', 'hao3', 'wo3', 'ai4', 'han4', 'yu3', 'pin1', 'yin1',
        'xian4', 'dai4', 'hua4', 'nv3', 'lve4', 'jue2', 'jvan1', 'shui3', 'er2',
    ];

    it('any two syllables joined equal the two written apart with the space removed', () => {
        const bad = [];
        for (const a of SYLLABLES) {
            for (const b of SYLLABLES) {
                const together = markTones(a + b);
                const apart = markTones(a + ' ' + b).replace(/ /g, '');
                if (together !== apart) bad.push(`${a + b}: ${together} !== ${apart}`);
            }
        }
        expect(bad).to.deep.equal([]);
    });

    it('three syllables joined behave the same way', () => {
        expect(markTones('ni3hao3ma5')).to.equal(markTones('ni3 hao3 ma5').replace(/ /g, ''));
        expect(markTones('wo3ai4ni3')).to.equal(markTones('wo3 ai4 ni3').replace(/ /g, ''));
    });
});

describe('splitting: nothing to cut at without a digit', () => {
    it('no tone digit anywhere means no guessed boundaries', () => {
        expect(markTones('china')).to.equal('china');
        expect(markTones('nihao')).to.equal('nihao');
    });
});

describe('splitting: the colon inside a joined run', () => {
    it('a colon in one syllable does not leak into its neighbours', () => {
        expect(markTones('ni3jv:1')).to.equal('nǐjǖ');
        expect(markTones('ni3ju:1')).to.equal('nǐjǖ');
        expect(markTones('ni3nve4')).to.equal('nǐnüè');
    });

    it('letters after the colon still belong to the same syllable', () => {
        expect(markTones('ni3lu:e4')).to.equal('nǐlüè');
    });

    it('in a joined run, bare and colon forms each keep their own spelling', () => {
        expect(markTones('ni3jv1')).to.equal('nǐjū');
        expect(markTones('ni3jvan1')).to.equal('nǐjuān');
        expect(markTones('ni3,jvan:1')).to.equal('nǐ,jüān');
    });
});
