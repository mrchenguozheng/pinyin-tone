// dist/index.cjs is a build product of lib/, not a second implementation — this test pins
// that claim down.
//
// Two things are checked separately:
//   1. Shape: require returns exactly one named export, markTones, with no default (matching
//      the ESM entry)
//   2. Behaviour: over a broad set of inputs, the CJS and ESM outputs must agree line for line
//
// The input set deliberately mixes in every edge: joined syllables, both legal colon
// positions, the three case forms, Chinese characters pressed against pinyin, digits as
// separators, illegal tones, the four combinations of strict and skip, and the cells of the
// tone-mark table for a/o/e/i/u/ü/ê/nasals. One difference anywhere means dist/ is stale, or
// that build-cjs.mjs missed something in the wrapping (a branch reading the wrong variable,
// TDZ, a wrong export shape).
//
// The CJS side is loaded with createRequire. The test file itself is ESM (type: module in
// package.json) and the artifact is .cjs, so what is being checked here is precisely that the
// require condition resolves to it. That is not the same as "require works on Node 14":
// require-ESM exists only from Node 22, and mocha will not run on Node 14. That layer is
// covered by scripts/smoke-entry.cjs against a real installation.
import { createRequire } from 'node:module';
import { markTones } from '../lib/index.js';
import { expect } from 'chai';

const require = createRequire(import.meta.url);
const cjs = require('../dist/index.cjs');

// [input, options] — covers every branch; undefined means no options passed
const CASES = [
    ['ni3 hao3', undefined],
    ['ni3hao3', undefined],
    ['zhong1 guo2 ren2', undefined],
    ['Zhong1guo2', undefined],
    ['BEI3JING1', undefined],
    ['ni3Hao3', undefined],
    ['hAo3', undefined],
    ['LV4', undefined],
    ['Lv4 se4', undefined],
    ['ju1 ju:1', undefined],
    ['ju:an1', undefined],
    ['jv:an1', undefined],
    ['lu:e4', undefined],
    ['uang:1', undefined],
    ['vv:1', undefined],
    ['ma3.5', undefined],
    ['ni3ma6', undefined],
    ['ni3 ma6', undefined],
    ['ni3_hao3', undefined],
    ['M2', undefined],
    ['M2 A4', undefined],
    ['A4', undefined],
    ['CO2', undefined],
    ['你好 ni3', undefined],
    ['ni3 你好', undefined],
    ['   ni3  ', undefined],
    ['\\ni3', undefined],
    ['C:\\Users', undefined],
    ['ni3hao3zi5', undefined],
    ['', undefined],
    // The tone-mark table: walk through every cell for a / o / e / i / u / ü / ê / nasals.
    // This group is the only thing that catches "edited the ESM source, forgot to rebuild
    // dist" — the cases above use a fixed handful of syllables and may never touch the cell
    // that was changed.
    ['a1 a2 a3 a4', undefined],
    ['o1 o2 o3 o4', undefined],
    ['e1 e2 e3 e4', undefined],
    ['yi1 yi2 yi3 yi4', undefined],
    ['wu1 wu2 wu3 wu4', undefined],
    ['lv1 lv2 lv3 lv4', undefined],
    ['e^1 e^2 e^3 e^4', undefined],
    ['m2 n2 ng2 hm2 hng2', undefined],
    ['mai3 mei3 mao3 mou3 miu4 hui4 dui4', undefined],
    ['jui1', { strict: true }],
    ['jui1', { strict: false }],
    ['duang1', { strict: true }],
    ['M2 hao3', { skip: 'M2' }],
    ['M2 A4', { skip: ['M2', 'A4'] }],
    ['jui1 M2', { strict: true, skip: 'M2' }],
    ['ni3hao3zi5', { strict: true }],
    ['', undefined],
];

describe('dist/index.cjs against the ESM entry', () => {
    it('exposes only one named export, markTones, and no default', () => {
        expect(Object.keys(cjs)).to.deep.equal(['markTones']);
        expect(cjs.default).to.equal(undefined);
        expect(cjs.markTones).to.be.a('function');
    });

    it('every input gives exactly the same output as ESM', () => {
        for (const [input, options] of CASES) {
            expect(cjs.markTones(input, options), JSON.stringify(input)).to.equal(markTones(input, options));
        }
    });

    it('non-string input behaves like ESM (throws the same way)', () => {
        for (const bad of [null, undefined, 42, {}]) {
            let esmError = null;
            let cjsError = null;
            try {
                markTones(bad);
            } catch (error) {
                esmError = error;
            }
            try {
                cjs.markTones(bad);
            } catch (error) {
                cjsError = error;
            }
            expect(Boolean(cjsError), String(bad)).to.equal(Boolean(esmError));
        }
    });
});
