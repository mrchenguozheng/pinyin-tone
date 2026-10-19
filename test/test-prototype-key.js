import { expect } from 'chai';
import toPinyinTones from '../v2/index.js';
import v1 from '../v1/index.js';

// Names that live on Object.prototype are the cheapest way to catch a lookup that is not
// confined to the table. They are not the reason this file exists any more, but they cost
// one line each, so they stay as a tripwire for the day someone rewrites the merge.
const prototypeNames = ['toString', 'constructor', 'valueOf', 'hasOwnProperty', 'isPrototypeOf'];
const prototypeNamesWithTone = ['toString1', 'constructor2', 'valueOf3'];

describe('v2: a name that lives on Object.prototype is not a syllable', () => {
    for (const key of [...prototypeNames, ...prototypeNamesWithTone]) {
        it(`'${key}' comes back unchanged`, () => {
            expect(toPinyinTones(key)).to.equal(key);
            expect(toPinyinTones(key)).to.equal(v1(key));
        });
    }

    it('the table is not affected: real syllables still convert', () => {
        expect(toPinyinTones('chu1 yin1 wei4 lai2')).to.equal('chū yīn wèi lái');
        expect(toPinyinTones('toString ma1')).to.equal('toString mā');
        expect(toPinyinTones('constructor ma1')).to.equal('constructor mā');
    });

    it('an ordinary unknown word is still returned unchanged', () => {
        expect(toPinyinTones('makkai')).to.equal('makkai');
        expect(toPinyinTones('xyz9')).to.equal('xyz9');
    });
});
