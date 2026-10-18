// test/test-example.js
// Cross-check the documentation examples — every output shown in the README and under docs/
// has to be reproducible by the real implementation.
//
// How it differs from the conversions table: that one tests whether the behaviour is right,
// and every entry added there is coverage; this one tests whether the documentation is still
// accurate, with expected values copied line by line out of the prose and tables.
// If only this file goes red after a change to the implementation, the code is probably fine
// and the documentation is out of date.
//
// Cases are named after README sections (edge cases live on the docs/ pages and carry the
// page name).
import { expect } from 'chai';
import {markTones} from '../lib/index.js';

describe('README examples', () => {
    it('Quick start', () => {
        expect(markTones('chu1 yin1 wei4 lai2')).to.equal('chū yīn wèi lái');
        expect(markTones('jv1 ju1 ju:1')).to.equal('jū jū jǖ');
        expect(markTones('今天ni3hao3')).to.equal('今天nǐhǎo');
    });

    it('How it reads a string', () => {
        expect(markTones('ni3hao3')).to.equal('nǐhǎo');
        expect(markTones('ni3,hao3')).to.equal('nǐ,hǎo');
        expect(markTones('hanyu3pin1yin1')).to.equal('hanyu3pin1yin1');
        expect(markTones('今天ni3hao3')).to.equal('今天nǐhǎo');
        // the three practical points made in the prose
        expect(markTones('ni3hao3ma')).to.equal('nǐhǎoma');
        expect(markTones('ni3haoma5')).to.equal('ni3haoma5');
        expect(markTones('han0yu3pin1yin1')).to.equal('hanyǔpīnyīn');
        expect(markTones('han4 yu3pin1yin1').replace(/ /g, '')).to.equal('hànyǔpīnyīn');
    });

    it('Two spellings of ü', () => {
        expect(markTones('jv1')).to.equal('jū');
        expect(markTones('jv1 ju1 ju:1')).to.equal('jū jū jǖ');
        expect(markTones('lu:e4')).to.equal('lüè');
    });

    it('Mixed text', () => {
        expect(markTones('ju是规范写法，而ju:1是不规范写法'))
            .to.equal('ju是规范写法，而jǖ是不规范写法');
        expect(markTones('abcju1')).to.equal('abcju1');
        expect(markTones('ju1abc')).to.equal('ju1abc');
        expect(markTones('ju')).to.equal('ju');
    });

    it('Errors you may need to fix', () => {
        expect(markTones('M2 货币供应量 hao3', {skip: 'M2'})).to.equal('M2 货币供应量 hǎo');
        expect(markTones('M2 A4 N3', {skip: ['M2', 'A4']})).to.equal('M2 A4 Ň');
        // the division of labour stated in the prose: a rule applies per run, and one call
        // can only handle a run one way
        expect(markTones('M2 M2', {skip: 'M2'})).to.equal('M2 M2');
    });
});

describe('docs/edge-cases.md examples', () => {
    it('the scan', () => {
        expect(markTones('ni3 hao3')).to.equal('nǐ hǎo');
        expect(markTones('a1b2c3')).to.equal('a1b2c3');
    });

    it('digits outside 0-5 and _', () => {
        expect(markTones('ma6')).to.equal('ma6');
        expect(markTones('ni3ma6')).to.equal('ni3ma6');
        expect(markTones('ni3 ma6')).to.equal('nǐ ma6');
        expect(markTones('ni3_hao3')).to.equal('ni3_hao3');
    });

    it('spacing', () => {
        expect(markTones('han4yu3pin1yin1')).to.equal('hànyǔpīnyīn');
        expect(markTones('han4 yu3  pin1   yin1')).to.equal('hàn yǔ  pīn   yīn');
        expect(markTones('han yu3pin1yin1')).to.equal('han yǔpīnyīn');
        // leading and trailing whitespace is not trimmed
        expect(markTones('  ni3 hao3  ')).to.equal('  nǐ hǎo  ');
    });
});

describe('docs/case.md examples', () => {
    it('the three forms, and mixed case', () => {
        expect(markTones('Zhong1guo2')).to.equal('Zhōngguó');
        expect(markTones('BEI3JING1')).to.equal('BĚIJĪNG');
        expect(markTones('ni3Hao3')).to.equal('nǐHǎo');
        expect(markTones('hAo3')).to.equal('hAo3');
        // the form is decided per syllable
        expect(markTones('ZHONG1guo2')).to.equal('ZHŌNGguó');
    });

    it('all-caps codes colliding with pinyin', () => {
        expect(markTones('A4')).to.equal('À');
        expect(markTones('O2')).to.equal('Ó');
        expect(markTones('CO2')).to.equal('CÓ');
    });
});

describe('docs/uu.md examples', () => {
    it('the two spellings', () => {
        expect(markTones('ju1')).to.equal('jū');
        expect(markTones('nv3')).to.equal('nǚ');
        expect(markTones('nu3')).to.equal('nǔ');
        expect(markTones('nu:3')).to.equal('nǚ');
    });

    it('the colon two legal positions', () => {
        expect(markTones('ju1 ju:1')).to.equal('jū jǖ');
        expect(markTones('juan:1')).to.equal('jüān');
        expect(markTones('gu:1')).to.equal('gǖ');
        expect(markTones('u:e1')).to.equal('üē');
        expect(markTones('jv:an1')).to.equal('jüān');
        expect(markTones('jvan:1')).to.equal('jüān');
    });

    it('a colon that misses, and one landing on v', () => {
        expect(markTones('ma:1')).to.equal('ma:1');
        expect(markTones('ji:1')).to.equal('ji:1');
        expect(markTones('uang:1')).to.equal('uang:1');
        expect(markTones('shui:3')).to.equal('shui:3');
        expect(markTones('j:van1')).to.equal('j:van1');
        expect(markTones('jva:n1')).to.equal('jva:n1');
        // the colon landed on v: same as writing the syllable bare
        expect(markTones('jv:1')).to.equal('jǖ');
        expect(markTones('vv:1')).to.equal('vǖ');
        expect(markTones('vv1')).to.equal('vǖ');
    });

    it('ê, and the interjections with no vowel', () => {
        expect(markTones('e^')).to.equal('ê');
        expect(markTones('e^2')).to.equal('ế');
        expect(markTones('e^4')).to.equal('ề');
        expect(markTones('be^2')).to.equal('be^2');
        expect(markTones('e^r')).to.equal('e^r');
        expect(markTones('e^:1')).to.equal('e^:1');
        expect(markTones('m2')).to.equal('ḿ');
        expect(markTones('ng4')).to.equal('ǹg');
        expect(markTones('hng1')).to.equal('hn̄g');
        expect(markTones('m3')).to.equal('m̌');
    });
});

describe('docs/strict.md examples', () => {
    it('what passes and what is actually rejected', () => {
        expect(markTones('jui1')).to.equal('juī');
        expect(markTones('duang1')).to.equal('duāng');
        expect(markTones('jui1', { strict: true })).to.equal('jui1');
        expect(markTones('duang1', { strict: true })).to.equal('duang1');
        expect(markTones('huar1', { strict: true })).to.equal('huār');
        expect(markTones('e^2', { strict: true })).to.equal('ế');
    });
});

describe('docs/skip.md examples', () => {
    it('no marker characters in the input', () => {
        expect(markTones('C:\\Users')).to.equal('C:\\Users');
        expect(markTones('\\texttt{ni3}')).to.equal('\\texttt{nǐ}');
        // a backslash is just a character here: it is neither eaten nor does it protect the
        // run after it
        expect(markTones('\\ni3')).to.equal('\\nǐ');
    });

    // The docs show this output as one literal backslash — '\nǐ', not '\\nǐ'. Read as a
    // JavaScript literal, '\\nǐ' is what the call returns; '\nǐ' is how it is displayed, so
    // that the page is not asking the reader to un-escape an escape.
    it('the displayed output really is a single backslash', () => {
        const shown = markTones('\\ni3');
        expect(shown.length).to.equal(3);
        expect(shown.charCodeAt(0)).to.equal(0x5c);
        expect(shown).to.equal('\\' + 'nǐ');
        expect(markTones('\\texttt{ni3}').charCodeAt(0)).to.equal(0x5c);
    });
});

describe('issue 回归', () => {
    // issue #8: an English word must not be cut up and treated as pinyin. With no tone digit
    // there is nothing to cut at, and with one the token only converts when the whole token is
    // a single syllable.
    it('issue #8: makkai comes back as written', () => {
        expect(markTones('makkai')).to.equal('makkai');
        expect(markTones('makkai1')).to.equal('makkai1');
    });

    // issue #16: unspaced input is supported. 0 and 5 also work as separators, and an erhua r
    // after a digit still belongs to the syllable before it.
    it('issue #16: a joined run converts without spaces being added', () => {
        expect(markTones('han0yur3pin1yin1')).to.equal('hanyǔrpīnyīn');
    });
});
