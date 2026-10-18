import { expect } from 'chai';
import toPinyinTones, { __warnedSpellings } from '../v2/index.js';

// A warning is the compromise between throwing and staying quiet. Throwing breaks callers
// on input that used to work; staying quiet means 'hAo3' comes back unchanged and looks
// like a successful conversion. So the value is always returned, and the console says why.
//
// The tests below stub console.warn, which means they also check the silence: an ordinary
// word must not produce a warning, or the channel becomes noise and people stop reading it.
describe('v2: a piece left alone says why, once', () => {
    let lines = [];
    let original;

    beforeEach(() => {
        lines = [];
        // The warning memory lives for the life of the module, so another test file may
        // already have reported these spellings. Clear it here or the first case passes
        // for the wrong reason.
        __warnedSpellings.clear();
        original = console.warn;
        console.warn = (...args) => lines.push(args.join(' '));
    });

    afterEach(() => {
        console.warn = original;
    });

    it('a piece that cannot be spelled in one case is returned and reported', () => {
        // 'hAo3' is not a spelling, so it comes back unchanged -- and the caller is told.
        expect(toPinyinTones('hAo3')).to.equal('hAo3');
        expect(lines).to.have.length(1);
        expect(lines[0]).to.contain('hAo');
    });

    it('the same spelling is reported once, not once per call', () => {
        for (let i = 0; i < 5; i++) {
            toPinyinTones('hAo3 hAo3 hAo3');
        }
        expect(lines).to.have.length(1);
    });

    it('an ordinary word is returned quietly', () => {
        // Warn on these and almost every call a caller makes prints something.
        expect(toPinyinTones('makkai')).to.equal('makkai');
        expect(toPinyinTones('hello')).to.equal('hello');
        expect(toPinyinTones('constructor')).to.equal('constructor');
        expect(toPinyinTones('xyz9')).to.equal('xyz9');
        expect(lines).to.have.length(0);
    });

    it('a converted piece says nothing', () => {
        expect(toPinyinTones('chu1 yin1 wei4 lai2')).to.equal('chū yīn wèi lái');
        expect(toPinyinTones('Hao3')).to.equal('Hǎo');
        expect(toPinyinTones('HAO3')).to.equal('HǍO');
        expect(lines).to.have.length(0);
    });
});
