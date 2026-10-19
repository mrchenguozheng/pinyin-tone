import { expect } from 'chai';
import toPinyinTones from '../v2/index.js';
import v1 from '../v1/index.js';

// The syllable pattern had no anchors, so it matched a slice of the text and dropped the
// rest. 'Hao3' came back as 'ǎo' -- the leading H was silently discarded, and nothing in
// the return value said so. These are the shapes that used to lose characters.
describe('v2: a piece is converted whole or not at all', () => {
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

describe('v2: the digit at the end says which tone', () => {
    it('0 and 5 both mean the neutral tone', () => {
        // They are the same thing in every notation this library follows, but only 0 used to
        // be accepted: 'ma5' came back as 'ma5' while 'ma0' came back as 'ma'.
        expect(toPinyinTones('ma5')).to.equal('ma');
        expect(toPinyinTones('ma0')).to.equal('ma');
        expect(toPinyinTones('ni3 hao5')).to.equal('nǐ hao');
    });

    it("'^' is not a tone", () => {
        // It used to be accepted by the pattern and then dropped, because parseInt('^') is
        // NaN and the fallback read that as the neutral tone: 'e^' came back as 'e'. The
        // table has no ê, so the piece is left as written instead of losing the marker.
        expect(toPinyinTones('e^')).to.equal('e^');
        expect(toPinyinTones('ma^')).to.equal('ma^');
    });

    it('a digit outside 0-5 is not a tone either', () => {
        expect(toPinyinTones('ma6')).to.equal('ma6');
        expect(toPinyinTones('ma9')).to.equal('ma9');
    });
});

describe('v2: the text comes back the shape it went in', () => {
    it('leading and trailing spaces survive', () => {
        // The input used to be trimmed, so '  ma1  ' came back as 'mā' -- the surrounding
        // text a caller had written was gone.
        expect(toPinyinTones('  ma1  ')).to.equal('  mā  ');
        expect(toPinyinTones(' ma1')).to.equal(' mā');
        expect(toPinyinTones('ma1 ')).to.equal('mā ');
    });

    it('the spaces between syllables survive as written', () => {
        expect(toPinyinTones('ma1  ma2')).to.equal('mā  má');
    });

    it('a line break or a tab does not stop the conversion', () => {
        // Splitting on a single space made the whole input one piece, which then failed to
        // match, so nothing converted at all: one syllable per line is a normal way to feed
        // a word list, and it used to come back untouched with no sign of trouble.
        expect(toPinyinTones('ma1\nma2')).to.equal('mā\nmá');
        expect(toPinyinTones('ma1\tma2')).to.equal('mā\tmá');
        expect(toPinyinTones('ma1\r\nma2')).to.equal('mā\r\nmá');
    });

    it('whitespace on its own is returned unchanged', () => {
        expect(toPinyinTones('  ')).to.equal('  ');
        expect(toPinyinTones('\n')).to.equal('\n');
        expect(toPinyinTones('')).to.equal('');
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

    it('nothing is reported, whatever the piece', () => {
        // A mixed-case piece used to print a line on console.warn -- once per spelling, and
        // at first on every brand name in the input too. The return value is the whole
        // answer now: a piece that comes back unchanged means it was left unchanged.
        const lines = [];
        const original = console.warn;
        console.warn = (...args) => lines.push(args.join(' '));
        try {
            expect(toPinyinTones('hAo3')).to.equal('hAo3');
            expect(toPinyinTones('iPhone McDonald JavaScript'))
                .to.equal('iPhone McDonald JavaScript');
            expect(toPinyinTones('ma1 hAo3 Hao3')).to.equal('mā hAo3 Hǎo');
        } finally {
            console.warn = original;
        }
        expect(lines).to.have.length(0);
    });
});
