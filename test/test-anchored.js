import { expect } from 'chai';
import toPinyinTones from '../v2/index.js';
import v1 from '../v1/index.js';

// The syllable pattern had no anchors, so it matched a slice of the text and dropped the
// rest. 'Hao3' came back as 'ǎo' -- the leading H was silently discarded, and nothing in
// the return value said so. These are the shapes that used to lose characters.
describe('v2: a piece is converted whole or not at all', () => {
    // 'hAo3' and friends warn by design; the warning has its own file.
    let original;
    before(() => {
        original = console.warn;
        console.warn = () => {};
    });
    after(() => {
        console.warn = original;
    });

    const lostCharacters = {
        Hao3: 'Hǎo',
        Lv4: 'Lǜ',
        Zhong1guo2: 'Zhong1guo2', // still one piece, not two syllables: no space to go by
        MA1: 'MĀ',
    };

    for (const [input, expected] of Object.entries(lostCharacters)) {
        it(`'${input}' -> '${expected}'`, () => {
            expect(toPinyinTones(input)).to.equal(expected);
        });
    }

    it('a piece with a character outside the pattern is left whole', () => {
        // These used to come back as the tail end of themselves: 'aX1' -> 'a', '1ma' -> 'ma'.
        expect(toPinyinTones('aX1')).to.equal('aX1');
        expect(toPinyinTones('1ma')).to.equal('1ma');
        expect(toPinyinTones('ma1.5')).to.equal('ma1.5');
        expect(toPinyinTones('ni3_hao3')).to.equal('ni3_hao3');
    });

    it('the syllable number is consumed, nothing else is', () => {
        // A tone digit turns into a tone mark on the vowel, so one character goes away and
        // the piece gets shorter by exactly that one. A piece that is not a syllable keeps
        // its full length -- that is the difference the missing anchors used to hide.
        expect(toPinyinTones('Hao3')).to.have.length(3); // H + a + o, digit consumed
        expect(toPinyinTones('hAo3')).to.have.length(4); // untouched, digit kept
        expect(toPinyinTones('aX1')).to.have.length(3);
        expect(toPinyinTones('1ma')).to.have.length(3);
        expect(toPinyinTones('ma1.5')).to.have.length(5);
        expect(toPinyinTones('ni3_hao3')).to.have.length(8);
    });
});

describe('v2: the three spellings of a syllable', () => {
    it('lower case, capitalised, and all caps all convert', () => {
        expect(toPinyinTones('hao3')).to.equal('hǎo');
        expect(toPinyinTones('Hao3')).to.equal('Hǎo');
        expect(toPinyinTones('HAO3')).to.equal('HǍO');
    });

    it('the shape is kept per syllable, not per input', () => {
        expect(toPinyinTones('ni3 Hao3')).to.equal('nǐ Hǎo');
        expect(toPinyinTones('NI3 HAO3')).to.equal('NǏ HǍO');
    });

    it('a syllable that cannot be spelled in one case is left alone', () => {
        // Mixed case inside one syllable is not a spelling anyone writes, so there is no
        // rule to apply and no tone mark to place. It stays exactly as it came in.
        expect(toPinyinTones('hAo3')).to.equal('hAo3');
        expect(toPinyinTones('HaO3')).to.equal('HaO3');
    });
});
