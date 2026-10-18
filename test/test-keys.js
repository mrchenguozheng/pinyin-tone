// test/test-keys.js
// Every dictionary key has to be reachable through the input syntax — otherwise it is dead
// data that can never be hit and only pads the dictionary.
//
// These assertions come from a bug that really existed: 'e^' sat in dict.js from the first
// version of v2 (value 'ê'), while /[a-z]+/ can never match ^, so e^2 always came back as
// written. The other case was a 'ü' key whose value duplicated v exactly and which was equally
// unreachable; it was removed. Now ^ is an optional suffix on e, both dead keys have a
// resolution, and "the key is reachable" is pinned down here as an invariant.
import {assert} from 'chai';
import {markTones} from '../lib/index.js';
import dict from '../lib/dict.js';

describe('e^: the ASCII spelling of ê', () => {
    it('the four tones', () => {
        assert.equal(markTones('e^1'), 'ê\u0304');
        assert.equal(markTones('e^2'), 'ế');
        assert.equal(markTones('e^3'), 'ê\u030c');
        assert.equal(markTones('e^4'), 'ề');
    });

    it('neutral tone: no digit, 0 and 5 all give ê', () => {
        assert.equal(markTones('e^'), 'ê');
        assert.equal(markTones('e^0'), 'ê');
        assert.equal(markTones('e^5'), 'ê');
    });

    it('code points: ê̄ and ê̌ are two code points (letter + combining mark); ế and ề are single', () => {
        assert.deepEqual([...markTones('e^1')].map((c) => c.codePointAt(0)), [0xEA, 0x304]);
        assert.deepEqual([...markTones('e^3')].map((c) => c.codePointAt(0)), [0xEA, 0x30C]);
        assert.equal(markTones('e^2').length, 1);
        assert.equal(markTones('e^2').codePointAt(0), 0x1EBF);
        assert.equal(markTones('e^4').length, 1);
        assert.equal(markTones('e^4').codePointAt(0), 0x1EC1);
    });

    it('^ only sits on e: no guessing which letter it belongs to', () => {
        for (const input of ['be^2', 'x^2', 'a^1', 'ma^3', 'e^r', 'e^x', 'e^^2']) {
            assert.equal(markTones(input), input);
        }
    });

    it('exclusive with the colon: ê has no u to mark', () => {
        for (const input of ['e^:', 'e^:1']) {
            assert.equal(markTones(input), input);
        }
    });

    it('joined syllables and mixed text', () => {
        assert.equal(markTones('e^2e^4'), 'ếề');
        assert.equal(markTones('ni3e^2'), 'nǐế');
        assert.equal(markTones('欸 e^2 欸'), '欸 ế 欸');
        assert.equal(markTones('e^x untouched'), 'e^x untouched');
    });

    it('strict accepts it: ê is a Standard Mandarin final', () => {
        assert.equal(markTones('e^2', {strict: true}), 'ế');
        assert.equal(markTones('e^', {strict: true}), 'ê');
    });

    it('idempotent: the output has no digit and no ^, so a second pass changes nothing', () => {
        for (const tone of ['', '0', '1', '2', '3', '4', '5']) {
            const once = markTones('e^' + tone);
            assert.equal(markTones(once), once);
        }
    });
});

describe('every dictionary key must be reachable', () => {
    const keys = Object.keys(dict);

    it('every key plus tone 2 converts', () => {
        // The probe is "key + 2": a plain letter key gives the standard form like ni2, and e^
        // gives e^2. The same concatenation works for both, with no special case.
        const dead = keys.filter((key) => markTones(key + '2') === key + '2');
        assert.deepEqual(dead, []);
    });

    it('the dictionary holds no character the syntax cannot build', () => {
        // A key has one of two shapes: plain lowercase letters, or e^. A key like 'ü', which
        // is neither a-z nor producible by any input, is not allowed to remain.
        const strange = keys.filter((k) => !/^[a-z]+$/.test(k) && k !== 'e^');
        assert.deepEqual(strange, []);
    });

    it("the 'ü' key is gone, and v still gives ü", () => {
        assert.isFalse('ü' in dict);
        assert.equal(markTones('v'), 'ü');
        assert.equal(markTones('v1'), 'ǖ');
        assert.equal(markTones('nv3'), 'nǚ');
    });

    // Whether every core key can produce a toned form is covered by "every key in core can
    // produce a toned form" in test-strict.js, which tries all four tones and is therefore
    // stronger than trying only 2.
});
