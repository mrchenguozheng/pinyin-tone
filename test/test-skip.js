// test/test-skip.js
// skip: declaring which runs stay as written. No marker characters are written into the
// input — everything to be kept is declared in the options, so text containing a backslash or
// a brace (paths, LaTeX, templates) loses nothing.
//
// Only a string or an array of strings is accepted, compared against the whole run and
// case-sensitively. Regular expressions and functions are not accepted: all the rule can see is
// one run at a time, so lookarounds and text-level anchors would silently stop working; and a
// predicate turns declarative options into imperative code, while everything it could express
// (one particular occurrence, surrounding context) requires the caller to know the shape of
// the text anyway.
//
// Two boundaries:
//   1. Only runs that **would** convert are asked about (a run already left alone has nothing
//      to keep).
//   2. Within one call a run can only be handled one way — to treat two occurrences
//      differently, cut the text and call once per part.
import { expect } from 'chai';
import {markTones} from '../lib/index.js';

describe('skip: keeping runs as written', () => {
    it('a string compares the whole run, not a syllable', () => {
        expect(markTones('M2 货币供应量 hao3', {skip: 'M2'})).to.equal('M2 货币供应量 hǎo');
        // the run is M2, not M
        expect(markTones('M2', {skip: 'M'})).to.equal('Ḿ');
        // a joined run is compared whole; the individual syllable names do not match
        expect(markTones('ni3hao3', {skip: 'ni3'})).to.equal('nǐhǎo');
        expect(markTones('ni3hao3', {skip: 'ni3hao3'})).to.equal('ni3hao3');
    });

    it('an array: several kept together, non-string items ignored', () => {
        expect(markTones('M2 A4 N3 hao3', {skip: ['M2', 'A4']})).to.equal('M2 A4 Ň hǎo');
        expect(markTones('M2 A4', {skip: ['M2', 42, null]})).to.equal('M2 À');
        // an empty array counts as not passed
        expect(markTones('M2', {skip: []})).to.equal('Ḿ');
    });

    it('only strings and arrays count: functions and regexes do not', () => {
        // the rule only compares run text; there is no ask-and-then-decide step
        expect(markTones('M2', {skip: () => true})).to.equal('Ḿ');
        // a regex reads as "search the whole text", while all this sees is one run, so it is
        // not accepted at all
        expect(markTones('M2', {skip: /^M2$/})).to.equal('Ḿ');
        expect(markTones('今天 M2', {skip: /(?<=今天 )M2/})).to.equal('今天 Ḿ');
    });

    it('a rule applies per run: one call can only handle a run one way', () => {
        // both M2 in the sentence are kept; there is no way to keep only one of them
        expect(markTones('M2 hao3 M2', {skip: 'M2'})).to.equal('M2 hǎo M2');
        // to treat them differently, cut the text and call separately
        expect(markTones('M2 hao3', {skip: 'M2'}) + markTones(' M2')).to.equal('M2 hǎo Ḿ');
    });

    it('a backslash is an ordinary character: not eaten, and no protection either', () => {
        expect(markTones('\\M2')).to.equal('\\Ḿ');
        expect(markTones('\\ni3')).to.equal('\\nǐ');
        // paths and LaTeX come through untouched (that part is glued to a word character and
        // would not convert anyway)
        expect(markTones('C:\\Users')).to.equal('C:\\Users');
        expect(markTones('\\texttt{ni3}')).to.equal('\\texttt{nǐ}');
        expect(markTones('\\ni3_hao3')).to.equal('\\ni3_hao3');
    });

    it('an unrecognised value counts as not passed (same as strict: options do not change the algorithm)', () => {
        for (const skip of [undefined, null, true, 42, {}, new Map()]) {
            expect(markTones('M2', {skip})).to.equal('Ḿ');
        }
    });

    it('skip is case-sensitive and does not touch whitespace or boundary checks', () => {
        expect(markTones('A4', {skip: 'a4'})).to.equal('À');
        expect(markTones('A4', {skip: 'A4'})).to.equal('A4');
        expect(markTones('  M2  ', {skip: 'M2'})).to.equal('  M2  ');
        expect(markTones('abcju1 M2', {skip: 'abcju1'})).to.equal('abcju1 Ḿ');
    });

    it('works together with strict', () => {
        expect(markTones('jui1 M2 hao3', {strict: true, skip: 'M2'})).to.equal('jui1 M2 hǎo');
    });
});
