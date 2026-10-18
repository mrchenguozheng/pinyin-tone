import { expect } from 'chai';
import toPinyinTones, { splitUnspacedSyllables, convertUnspacedPinyin } from '../v2/index.js';
import v1 from '../v1/index.js';

// v2 used to throw on anything that was not a string — `toPinyinTones(data.name)` with an
// undefined name crashed instead of coming back undefined. v1 has always returned the argument
// untouched in that case; these tests pin the two implementations together.
const notStrings = [undefined, null, 42, true, {}, ['ma1'], () => 'ma1'];

describe('v2: a value that is not a string comes back unchanged', () => {
    for (const value of notStrings) {
        const label = JSON.stringify(value) ?? String(value);

        it(`toPinyinTones(${label})`, () => {
            expect(toPinyinTones(value)).to.equal(value);
        });

        it(`splitUnspacedSyllables(${label})`, () => {
            expect(splitUnspacedSyllables(value)).to.equal(value);
        });

        it(`convertUnspacedPinyin(${label})`, () => {
            expect(convertUnspacedPinyin(value)).to.equal(value);
        });

        it(`v1(${label}) agrees`, () => {
            expect(v1(value)).to.equal(value);
            expect(toPinyinTones(value)).to.equal(v1(value));
        });
    }

    it('the empty string still goes down the normal path', () => {
        expect(toPinyinTones('')).to.equal('');
        expect(splitUnspacedSyllables('')).to.equal('');
        expect(convertUnspacedPinyin('')).to.equal('');
    });

    it('a string that cannot be converted is still returned as the same string', () => {
        expect(toPinyinTones('makkai')).to.equal('makkai');
    });
});
