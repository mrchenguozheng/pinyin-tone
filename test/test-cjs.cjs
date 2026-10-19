// The two entry points have to agree. dist/ is generated from the ESM sources, so the risk is
// not a wrong answer in one of them -- it is a source edit that never made it through the
// build, or an entry file wired to the wrong module. Running every syllable the dictionary
// knows, in every tone and every spelling, through both entries is the cheapest way to notice.
//
// The file is .cjs because this test is also the assertion for the CommonJS side: the package
// says "type": "module", so a .js file here could not require() it at all.

const {expect} = require('chai');

// require() of an ES module (Node 22.12 and later) hands back the module namespace, not the
// default export, so each one is taken apart the same way: `.default` is the function.
const esm = require('../index.js').default;
const esmV2Module = require('../v2/index.js');
const esmV2 = esmV2Module.default;
const {convertUnspacedPinyin, splitUnspacedSyllables} = esmV2Module;
const esmV1 = require('../v1/index.js').default;
const esmMark = require('../workaround/index.js').default;

// The CommonJS entries, one per subpath. Each has to have the shape its ESM counterpart
// declares: a callable, with the named exports on it.
const cjs = require('../dist/index.cjs');
const cjsV1 = require('../dist/v1.cjs');
const cjsV2 = require('../dist/v2.cjs');
const cjsMark = require('../dist/workaround.cjs');

// Two sources of syllables: a list of the regular ones, plus the dictionary itself, which is
// read from the ESM build so that a key added there and missed here still gets compared.
const regular = ['ma', 'hao', 'chu', 'yin', 'wei', 'lai', 'liou', 'yuen', 'huar', 'er', 'ng', 'lv', 'jue'];

const inputs = new Set();
const add = (syllable, tone, shape) => inputs.add(shape(syllable) + tone);
const shapes = [(s) => s, (s) => s[0].toUpperCase() + s.slice(1), (s) => s.toUpperCase()];

for (const syllable of regular) {
    for (const tone of ['', '0', '1', '2', '3', '4', '5', '6']) {
        for (const shape of shapes) add(syllable, tone, shape);
    }
}

// The whole unspaced dictionary, one entry per line, converted by both entries.
const dictionary = [
    'han4yu3pin1yin1', 'han4yu3', 'han0yu3pin1yin1', 'hanyu3pin1yin1',
    'chu1yin1wei4lai2', 'liou2yuen2', 'huar1renr2shuir3yuer4',
];

describe('CommonJS entry: the same answers as the ESM entry', () => {
    it('the root export is still the function require() used to get', () => {
        expect(cjs).to.be.a('function');
        expect(cjs('chu1 yin1 wei4 lai2')).to.equal('chū yīn wèi lái');
    });

    it('the named exports hang off it, the way the ESM entry exports them', () => {
        expect(cjs.v2).to.be.a('function');
        expect(cjs.markSinglePinyinVowel).to.be.a('function');
        expect(cjs.v2('liou2 yuen2')).to.equal('lióu yuén');
        expect(cjs.markSinglePinyinVowel('a1')).to.equal('ā');
    });

    it('.default points back at the function, for transpiled imports', () => {
        // Babel, and TypeScript with esModuleInterop, read require('pinyin-tone').default.
        expect(cjs.default).to.equal(cjs);
    });

    it('every syllable and tone matches the ESM entry', () => {
        const mismatched = [];
        for (const input of inputs) {
            if (cjs(input) !== esm(input)) mismatched.push([input, esm(input), cjs(input)]);
            if (cjs.v2(input) !== esmV2(input)) mismatched.push([input, esmV2(input), cjs.v2(input)]);
        }
        expect(mismatched).to.deep.equal([]);
        expect(inputs.size).to.be.greaterThan(300);
    });

    it('edge inputs match too', () => {
        for (const input of ['', '   ', '  ma1  ', 'ma1\nma2', 'ma1\tma2', 'hua1r', 'e^', 'toString', 'iPhone']) {
            expect(cjs(input), JSON.stringify(input)).to.equal(esm(input));
            expect(cjs.v2(input), JSON.stringify(input)).to.equal(esmV2(input));
            expect(cjs.markSinglePinyinVowel(input)).to.equal(esmMark(input));
        }
    });

    it('convertUnspacedPinyin matches', () => {
        for (const input of dictionary) {
            expect(cjs.v2.convertUnspacedPinyin(input)).to.equal(convertUnspacedPinyin(input));
            expect(cjsV2.convertUnspacedPinyin(input)).to.equal(convertUnspacedPinyin(input));
        }
    });

    it('splitUnspacedSyllables matches', () => {
        for (const input of dictionary) {
            expect(cjs.v2.splitUnspacedSyllables(input)).to.equal(splitUnspacedSyllables(input));
            expect(cjsV2.splitUnspacedSyllables(input)).to.equal(splitUnspacedSyllables(input));
        }
    });
});

describe('CommonJS subpath entries: one shape each', () => {
    it('v2 is callable and carries its named exports', () => {
        // Both forms are in use by 2.x callers, so both have to work off the same object:
        //   const v2 = require('pinyin-tone/v2');                v2('ni3')
        //   const {convertUnspacedPinyin} = require('pinyin-tone/v2');
        expect(cjsV2).to.be.a('function');
        expect(cjsV2('liou2 yuen2')).to.equal('lióu yuén');
        expect(cjsV2.convertUnspacedPinyin).to.be.a('function');
        expect(cjsV2.splitUnspacedSyllables).to.be.a('function');
        expect(cjsV2.default).to.equal(cjsV2);
    });

    it('v1 and workaround are callable', () => {
        expect(cjsV1).to.be.a('function');
        expect(cjsV1('chu1 yin1 wei4 lai2')).to.equal('chū yīn wèi lái');
        expect(cjsMark).to.be.a('function');
        expect(cjsMark('a1')).to.equal('ā');
        // The prototype names still come back as strings, through this entry too.
        expect(cjsMark('toString')).to.equal('toString');
    });

    it('every subpath entry is the same object the root already had', () => {
        // One implementation, several doors. If these ever stop being equal, the build has
        // started copying a module instead of handing back the one it evaluated.
        expect(cjs.v1).to.equal(cjsV1);
        expect(cjs.v2).to.equal(cjsV2);
        expect(cjs.markSinglePinyinVowel).to.equal(cjsMark);
    });

    it('the subpaths agree with the ESM subpaths', () => {
        for (const input of dictionary) {
            expect(cjsV2(input)).to.equal(esmV2(input));
            expect(cjsV1(input)).to.equal(esmV1(input));
        }
    });

    it('workaround hands back a string where the table has no entry', () => {
        for (const input of ['', 'toString', '__proto__', 'constructor', 'zz', 'a6']) {
            expect(cjsMark(input), JSON.stringify(input)).to.equal(esmMark(input));
            expect(cjsMark(input), JSON.stringify(input)).to.be.a('string');
        }
    });
});
