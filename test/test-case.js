// test/test-case.js
// The three legal letter-case forms: all lowercase, initial capital, all capitals.
//
// Based on 汉语拼音正词法基本规则 (GB/T 16159—2012) §6.3: capitals appear at the start of a
// sentence, at the start of a line of verse, in the first letter of a proper name, and "in
// some contexts a proper name may be written entirely in capitals" (BĚIJĪNG, LǏ HUÁ). The
// tone rules in §6.5 make no exception for capitals — the standard's own all-caps example
// keeps its tone marks. Mixing case inside a syllable (hAo3) is not something the standard
// writes, so the run comes back as written.
//
// Case is decided per syllable, so one token can hold an all-caps syllable and an all-lowercase
// one (ZHONG1guo2 -> ZHŌNGguó) — which is exactly "capitalise the first letter of the name,
// keep the rest lowercase".
import { expect } from 'chai';
import {markTones} from '../lib/index.js';

describe('case: the tone mark lands on the capital vowel', () => {
    it('ü series: Unicode has precomposed capital glyphs with tone marks', () => {
        expect(markTones('NV3')).to.equal('N\u01D9');        // NǙ
        expect(markTones('LV4')).to.equal('L\u01DB');        // LǛ
        expect(markTones('NV2')).to.equal('N\u01D7');        // NǗ
        expect([...markTones('NV3')]).to.have.length(2);     // not N + a combining mark
    });

    it('ê: tones 2 and 4 are precomposed, tones 1 and 3 have to be assembled', () => {
        expect(markTones('E^')).to.equal('\u00CA');            // Ê
        expect(markTones('E^2')).to.equal('\u1EBE');           // Ế
        expect(markTones('E^4')).to.equal('\u1EC0');           // Ề
        expect(markTones('E^1')).to.equal('\u00CA\u0304');     // Ê + combining mark
    });

    it('interjection syllables with no vowel: the mark lands on the nasal', () => {
        expect(markTones('M2')).to.equal('\u1E3E');            // Ḿ
        expect(markTones('NG3')).to.equal('\u0147G');         // ŇG
        expect(markTones('HNG1')).to.equal('HN\u0304G');       // HN̄G
    });

    it('the colon, ^ and letter case are independent', () => {
        expect(markTones('JU:1')).to.equal('J\u01D5');         // JǕ
        expect(markTones('JVAN:1')).to.equal('J\u00DC\u0100N'); // JÜĀN
        expect(markTones('Jv:1')).to.equal('J\u01D6');         // Jǖ (initial capital only)
        expect(markTones('V:1')).to.equal('\u01D5');           // Ǖ
    });
});

describe('case: the form is decided per syllable', () => {
    it('proper-name form: first syllable capitalised, the rest lowercase', () => {
        expect(markTones('Zhong1guo2')).to.equal('Zhōngguó');
        expect(markTones('Bei3jing1')).to.equal('Běijīng');
    });

    it('two forms in one token, each handled by its own rule', () => {
        expect(markTones('ZHONG1guo2')).to.equal('ZHŌNGguó');
        expect(markTones('Ni3hao3')).to.equal('Nǐhǎo');
        expect(markTones('NI3hao3')).to.equal('NǏhǎo');
    });

    it('when syllables are joined, a capital no longer blocks its neighbours', () => {
        expect(markTones('ni3Hao3')).to.equal('nǐHǎo');
        expect(markTones('ni3Hao3ma5')).to.equal('nǐHǎoma');
    });
});

describe('case: input outside the three forms comes back as written', () => {
    it('case mixed inside a syllable', () => {
        for (const s of ['hAo3', 'HaO3', 'aNd3', 'nI3hao3']) {
            expect(markTones(s), s).to.equal(s);
        }
    });

    it('mixing does not spoil only one part: the whole run is dropped, no partial output', () => {
        expect(markTones('ni3hAo3')).to.equal('ni3hAo3');
    });

    it('an all-caps run glued to an English word still stays put', () => {
        expect(markTones('ABCJU1')).to.equal('ABCJU1');
        expect(markTones('JU1ABC')).to.equal('JU1ABC');
        expect(markTones('3JU1')).to.equal('3JU1');
        expect(markTones('ni3_HAO3')).to.equal('ni3_HAO3');
    });
});

describe('case: with strict, and on a second pass', () => {
    it('strict looks at the syllable, not the case', () => {
        expect(markTones('HUA1', {strict: true})).to.equal('HUĀ');
        expect(markTones('JUI1', {strict: true})).to.equal('JUI1');
    });

    it('capitalised text that already has tone marks is unchanged by a second pass', () => {
        for (const s of ['BĚIJĪNG', 'NǙ', 'Ế', 'HN̄G', 'ZHŌNGguó']) {
            expect(markTones(s), s).to.equal(s);
        }
    });
});
