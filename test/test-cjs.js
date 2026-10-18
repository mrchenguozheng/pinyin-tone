// dist/index.cjs 是 lib/ 的构建产物，不是第二份实现 —— 这条测试就是把这句话钉住。
//
// 两件事分开验：
//   1. 形状：require 回来只有一个具名 markTones，没有 default（与 ESM 入口一致）
//   2. 行为：在一批覆盖面较宽的输入上，CJS 与 ESM 的输出必须逐条相同
//
// 输入集刻意混进各条边界：连写分词、冒号两种合法位置、大小写三形态、汉字紧贴、
// 数字断句、非法声调、strict 与 skip 的四种组合，以及调号表里 a/o/e/i/u/ü/ê/鼻音
// 各自的格子。两边只要有一条不同，就说明 dist/ 过期了，或 build-cjs.mjs 的包裹
// 规则漏了东西（某个分支读了错的变量、TDZ、导出形状不对）。
//
// CJS 侧用 createRequire 载入。测试文件本身是 ESM（package.json 里 type: module），
// 产物是 .cjs —— 于是这里验的正是 require 条件能解析到它。注意这不等于
// 「在 Node 14 上 require 得到」：require-ESM 的能力只有 Node 22 有，
// 而 mocha 跑不起来 Node 14。那一层由 scripts/smoke-entry.cjs 用真实安装验。
import { createRequire } from 'node:module';
import { markTones } from '../lib/index.js';
import { expect } from 'chai';

const require = createRequire(import.meta.url);
const cjs = require('../dist/index.cjs');

// [输入, 选项] —— 覆盖各条分支；选项为 undefined 表示不传
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
    // 调号表：a / o / e / i / u / ü / ê / 鼻音各自的格子都走一遍。
    // 这一组是「只改 ESM 源、忘了重新生成 dist」时唯一能抓到的地方 ——
    // 上面那些用例用的是固定的几条音节，未必踩到被改的那一格。
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

describe('dist/index.cjs 与 ESM 入口', () => {
    it('只暴露一个具名 markTones，没有 default', () => {
        expect(Object.keys(cjs)).to.deep.equal(['markTones']);
        expect(cjs.default).to.equal(undefined);
        expect(cjs.markTones).to.be.a('function');
    });

    it('每条输入都与 ESM 输出逐字相同', () => {
        for (const [input, options] of CASES) {
            expect(cjs.markTones(input, options), JSON.stringify(input)).to.equal(markTones(input, options));
        }
    });

    it('非字符串输入的表现与 ESM 一致（同样抛错）', () => {
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
