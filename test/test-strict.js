// test/test-strict.js
// Strict mode: only the 426 syllables of Standard Mandarin (plus 418 erhua keys); every
// other run is returned as written. The default mode is untouched — the dictionary still has
// its 1952 keys and none of them is blocked.
import {assert} from 'chai';
import {markTones} from '../lib/index.js';
import dict from '../lib/dict.js';
import core from '../lib/core.js';

/** An erhua key: drop the trailing r and you have the base. `er` is a syllable itself. */
const isErhua = (key) => key !== 'er' && key.length > 1 && key.endsWith('r');

describe('strict mode', () => {
    describe('the default mode changes nothing', () => {
        // None of these is a syllable in Standard Mandarin, and the default mode converts
        // them all the same — this is the long-standing permissive behaviour.
        const EXTENDED = ['jui1', 'juang1', 'juei2', 'jua4', 'biong2', 'duang1', 'biu1', 'vai1'];
        const EXPECTED = ['juī', 'juāng', 'juéi', 'juà', 'bióng', 'duāng', 'biū', 'vāi'];

        EXTENDED.forEach((input, i) => {
            it(`${input} -> ${EXPECTED[i]}`, () => {
                assert.equal(markTones(input), EXPECTED[i]);
            });
        });
    });

    describe('strict mode accepts only Standard Mandarin syllables', () => {
        const CORE = [
            ['ma1', 'mā'], ['ni3', 'nǐ'], ['hao3', 'hǎo'], ['xiong2', 'xióng'],
            ['zhuang1', 'zhuāng'], ['lv4', 'lǜ'], ['er2', 'ér'], ['e1', 'ē'],
            ['dia3', 'diǎ'], ['rua2', 'ruá'], ['nun2', 'nún'], ['zhei4', 'zhèi'],
            ['m2', 'ḿ'], ['n2', 'ń'], ['ng2', 'ńg'],
        ];

        CORE.forEach(([input, expected]) => {
            it(`${input} -> ${expected}`, () => {
                assert.equal(markTones(input, {strict: true}), expected);
            });
        });

        // Cartesian-product noise, internet and colloquial syllables, and v used as a
        // consonant: strict mode rejects all three kinds.
        const EXTENDED = ['jui1', 'juang1', 'juei2', 'jua4', 'biong2', 'duang1', 'biu1', 'vai1',
            'bvan1', 'shvi1', 'gv1', 'juangr1'];

        EXTENDED.forEach((input) => {
            it(`${input} comes back as written`, () => {
                assert.equal(markTones(input, {strict: true}), input);
            });
        });
    });

    describe('interjection syllables: copy the dictionary, derive the rest', () => {
        // These nine are the forms that actually occur in the dictionary, copied one by one
        // from pypinyin's pinyin_dict
        // (m̄ 嘸, ḿ 呒呣唔嘸, m̀ 呣; ń 咹哽唔嗯, ň 㕶嗯, ǹ 哏嗯; ńg, ňg, ǹg 嗯)
        const LISTED = [
            ['m1', 'm\u0304'], ['m2', 'ḿ'], ['m4', 'm\u0300'],
            ['n2', 'ń'], ['n3', 'ň'], ['n4', 'ǹ'],
            ['ng2', 'ńg'], ['ng3', 'ňg'], ['ng4', 'ǹg'],
        ];

        LISTED.forEach(([input, expected]) => {
            it(`${input} -> ${expected}`, () => {
                assert.equal(markTones(input), expected);
            });
        });

        // Gaps in the dictionary are not rejected; they are filled in by the rule "mark the
        // last nasal": m has no third tone, n and ng have no first tone, and hm (噷) and
        // hng (哼) exist only without a tone. These eleven are derived forms — the glyph comes
        // from the rule, not from the dictionary.
        const DERIVED = [
            ['m3', 'm\u030c'],
            ['n1', 'n\u0304'],
            ['ng1', 'n\u0304g'],
            ['hm1', 'hm\u0304'], ['hm2', 'hḿ'], ['hm3', 'hm\u030c'], ['hm4', 'hm\u0300'],
            ['hng1', 'hn\u0304g'], ['hng2', 'hńg'], ['hng3', 'hňg'], ['hng4', 'hǹg'],
        ];

        DERIVED.forEach(([input, expected]) => {
            it(`${input} -> ${expected}`, () => {
                assert.equal(markTones(input), expected);
            });
        });

        it('dictionary forms and derived cells are disjoint, and cover all 20', () => {
            // The two groups above already check each glyph one by one; this only checks
            // ownership: a cell cannot be claimed both by the dictionary and by the rule,
            // because then neither would be responsible for it.
            const listedInputs = LISTED.map(([input]) => input);
            const derivedInputs = DERIVED.map(([input]) => input);
            assert.deepEqual(derivedInputs.filter((input) => listedInputs.includes(input)), []);

            // m / n / ng / hm / hng x four tones: every cell needs an owner. A missing cell
            // means nobody has said whether that syllable takes that tone.
            const listed = new Set(listedInputs);
            const derived = new Set(derivedInputs);
            const cells = ['m', 'n', 'ng', 'hm', 'hng']
                .flatMap((key) => [1, 2, 3, 4].map((tone) => key + tone));
            assert.deepEqual(cells.filter((cell) => !listed.has(cell) && !derived.has(cell)), []);
        });

        it('the neutral tone is untouched: a toneless form is the syllable itself', () => {
            ['m', 'n', 'ng', 'hm', 'hng'].forEach((key) => {
                assert.equal(markTones(key), key);
                assert.equal(markTones(key + '5'), key);
                assert.equal(markTones(key + '0'), key);
            });
        });

        it('m̄ and m̀ are two code points: letter plus combining mark', () => {
            // These two have no precomposed character, so U+0304 / U+0300 must be stacked on
            assert.deepEqual([...markTones('m1')].map((c) => c.codePointAt(0)), [0x6D, 0x304]);
            assert.deepEqual([...markTones('m4')].map((c) => c.codePointAt(0)), [0x6D, 0x300]);
            // ḿ / ń are precomposed and take a single code point
            assert.equal(markTones('m2').length, 1);
            assert.equal(markTones('n2').length, 1);
            // m̌ has no precomposed character either
            assert.deepEqual([...markTones('m3')].map((c) => c.codePointAt(0)), [0x6D, 0x30C]);
        });
    });

    describe('erhua is decided by its base', () => {
        it('a base that is a syllable passes', () => {
            assert.equal(markTones('huar1', {strict: true}), 'huār');
            assert.equal(markTones('nar3', {strict: true}), 'nǎr');
            assert.equal(markTones('dianr3', {strict: true}), 'diǎnr');
        });

        it('a base that is not a syllable fails', () => {
            assert.equal(markTones('juir1', {strict: true}), 'juir1');
            assert.equal(markTones('buair1', {strict: true}), 'buair1');
        });

        it('er is a syllable, not e plus r', () => {
            assert.equal(markTones('er2', {strict: true}), 'ér');
            assert.equal(markTones('er0', {strict: true}), 'er');
        });
    });

    describe('a literal spelling does not bypass the allow-list', () => {
        // jv / jve / jvan / jvn are the same phoneme as ju, so the converted form still has
        // to pass core
        it('jv1 passes just like ju1', () => {
            assert.equal(markTones('jv1', {strict: true}), 'jū');
            assert.equal(markTones('jve2', {strict: true}), 'jué');
        });

        it('a form that is still not a syllable after conversion fails', () => {
            assert.equal(markTones('jvi1', {strict: true}), 'jvi1');
            assert.equal(markTones('jvangr1', {strict: true}), 'jvangr1');
        });

        it('the ü a colon asks for must land on a syllable too', () => {
            assert.equal(markTones('ju:1', {strict: true}), 'jǖ');
            // g does not take ü, so gǖ is not a syllable: the default mode gives it, strict
            // mode rejects it
            assert.equal(markTones('gu:1', {strict: true}), 'gu:1');
            assert.equal(markTones('gu:1'), 'gǖ');
        });
    });

    describe('counting the whole table', () => {
        const keys = Object.keys(dict);
        // A key survives strict mode if any of the four tones produces a glyph. Checking the
        // first tone alone would not do: the dictionary has no first tone for n and ng (that
        // cell comes from the rule).
        const passes = (key) => [1, 2, 3, 4].some(
            (tone) => markTones(key + tone, {strict: true}) !== key + tone,
        );

        // Of the dictionary's 1952 keys, strict mode lets 876 through and rejects 1076.
        // 876 = core 426 + erhua 418 + the 32 literal jv spellings.
        //   jv/jve/jvan/jvn and their erhua variants are the same phoneme as ju/jue/juan/jun,
        //   so they are still syllables after conversion.
        // 1076 = the 1110 cartesian-product entries, minus those 32 literal spellings, minus
        //   e^ (a dead key until it was added to core, which is what lets it hold in strict
        //   mode).
        it('lets 876 keys through and rejects 1076', () => {
            const passed = keys.filter(passes);
            assert.equal(passed.length, 876);
            assert.equal(keys.length - passed.length, 1076);
        });

        it('442 not erhua, 434 erhua', () => {
            const passed = keys.filter(passes);
            assert.equal(passed.filter((k) => !isErhua(k)).length, 442);
            assert.equal(passed.filter(isErhua).length, 434);
        });

        it('every key in core can produce a toned form', () => {
            const toneless = [...core].filter((k) => !passes(k));
            assert.deepEqual(toneless.sort(), []);
        });

        it('the only passes outside core are the literal jv spellings', () => {
            const LITERAL = ['jv', 'jve', 'jvan', 'jvn', 'qv', 'qve', 'qvan', 'qvn',
                'xv', 'xve', 'xvan', 'xvn', 'yv', 'yve', 'yvan', 'yvn'];
            const outside = keys
                .filter(passes)
                .filter((k) => !core.has(isErhua(k) ? k.slice(0, -1) : k));

            assert.deepEqual(outside.sort(), [...LITERAL, ...LITERAL.map((k) => k + 'r')].sort());
        });

        it('every key in core is in the dictionary', () => {
            const missing = [...core].filter((k) => dict[k] === undefined);
            assert.deepEqual(missing, []);
        });
    });

    describe('the option only acts on strict', () => {
        it('an empty object, undefined and null all mean the default mode', () => {
            assert.equal(markTones('jui1', {}), 'juī');
            assert.equal(markTones('jui1', undefined), 'juī');
            assert.equal(markTones('jui1', null), 'juī');
        });

        it('only a truthy value means strict mode', () => {
            assert.equal(markTones('jui1', {strict: 1}), 'jui1');
            assert.equal(markTones('jui1', {strict: 'no'}), 'jui1');
            assert.equal(markTones('jui1', {strict: false}), 'juī');
        });

        it('an unknown field is ignored', () => {
            // strictMode was never the option name — it is strict — so an unrecognised name
            // counts as not passed
            assert.equal(markTones('jui1', {strictMode: true}), 'juī');
        });
    });

    describe('it applies inside mixed sentences too', () => {
        it('a sentence mixing Chinese and pinyin is filtered by strict as a whole', () => {
            assert.equal(
                markTones('你好 ni3hao3 和 jui1', {strict: true}),
                '你好 nǐhǎo 和 jui1',
            );
            assert.equal(
                markTones('你好 ni3hao3 和 jui1'),
                '你好 nǐhǎo 和 juī',
            );
        });

        it('the colon form in strict mode: convert to the standard spelling, then check the allow-list', () => {
            assert.equal(markTones('ju:1', {strict: true}), 'jǖ');
            // jui:1 fails not because "the colon does not accept this final" but because the
            // dictionary only has jv/jve/jvan/jvn under j (the same phoneme as
            // ju/jue/juan/jun) and no jvi — a colon requires the landing point to really
            // produce ü, and this cell has no literal form to swap in.
            // Both modes have nowhere to land, so the run comes back as written. For
            // contrast: gu:1 holds in the default mode (gǖ) and fails in strict mode because
            // gǖ is not a syllable — that is the allow-list doing its job.
            assert.equal(markTones('jui:1', {strict: true}), 'jui:1');
            assert.equal(markTones('jui:1'), 'jui:1');
        });
    });
});
