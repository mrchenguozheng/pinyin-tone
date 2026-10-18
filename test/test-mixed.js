// test/test-mixed.js
// 中文与拼音混排时的整句转换，以及用冒号表示 ü 两点的写法。
//
// 入口只有一个：在整段文字里扫候选片段，只替换能成词的片段，
// 其余字符（汉字、标点、空白）逐字保留。
//
// 两种标记：
//   裸写 ju1 / jv1  -> 规范形式 jū
//   ju:1            -> 冒号代表 u 上面那两点，输出 jǖ
// 冒号只对 ü 真正能出现的声母生效（n/l/j/q/x/y 与零声母 u），其余原样返回。
import { expect } from 'chai';
import {markTones} from '../lib/index.js';
import dict from '../lib/dict.js';
import { expectedValue } from './support/dict-values.js';

const HEADS = ['j', 'q', 'x', 'y'];
const FINALS = ['v', 've', 'van', 'vn', 'vr', 'ver', 'vanr', 'vnr'];
const LITERAL_KEYS = HEADS.flatMap((h) => FINALS.map((f) => h + f));
const CANONICAL_KEYS = LITERAL_KEYS.map((k) => k.replace('v', 'u'));
const TONES = [0, 1, 2, 3, 4];

/** 只保留汉字，用于校验非拼音内容没被改动 */
const hanOnly = (s) => s.replace(/[^\u4e00-\u9fff]/g, '');

describe('混排文本：只换拼音片段', () => {
    describe('核心用例：一句里并排两种写法', () => {
        const input = 'ju是规范写法，而ju:1是不规范写法，因为u:1在j后面要省略上面的两点';
        const output = 'ju是规范写法，而jǖ是不规范写法，因为ǖ在j后面要省略上面的两点';

        it('裸写保持原样，冒号转成字面形式', () => {
            expect(markTones(input)).to.equal(output);
        });

        it('中文与标点逐字保留', () => {
            expect(hanOnly(markTones(input))).to.equal(hanOnly(input));
        });

        it('输出再跑一次不再变化（幂等）', () => {
            const once = markTones(input);
            expect(markTones(once)).to.equal(once);
        });

        it('输入里不需要出现任何 ü 系字符', () => {
            expect(/[üǖǘǚǜ]/.test(input), '输入不该含 ü').to.equal(false);
        });
    });

    describe('裸写：默认规范形式', () => {
        it('ju1 与 jv1 都输出 jū', () => {
            expect(markTones('ju1')).to.equal('jū');
            expect(markTones('jv1')).to.equal('jū');
        });

        it('同一句里两种写法结果相同', () => {
            expect(markTones('ju1和jv1')).to.equal('jū和jū');
            expect(markTones('jue2和jve2')).to.equal('jué和jué');
            expect(markTones('juan1和jvan1')).to.equal('juān和juān');
        });
    });

    describe('冒号：u 上面那两点', () => {
        it('ju:1 输出 jǖ，而裸 ju1 仍是 jū', () => {
            expect(markTones('ju:1')).to.equal('jǖ');
            expect(markTones('ju1')).to.equal('jū');
        });

        it('四个可省两点的韵母都支持', () => {
            expect(markTones('ju:1')).to.equal('jǖ');
            expect(markTones('jue:2')).to.equal('jüé');
            expect(markTones('juan:1')).to.equal('jüān');
            expect(markTones('jun:4')).to.equal('jǜn');
        });

        it('q/x/y 同样生效', () => {
            expect(markTones('qu:1')).to.equal('qǖ');
            expect(markTones('xue:3')).to.equal('xüě');
            expect(markTones('yun:2')).to.equal('yǘn');
        });

        it('n/l 的 ü 也能用冒号写出来', () => {
            expect(markTones('nu:3')).to.equal('nǚ');
            expect(markTones('lu:4')).to.equal('lǜ');
            // 不带冒号时仍是普通 u
            expect(markTones('nu3')).to.equal('nǔ');
            expect(markTones('lu4')).to.equal('lù');
        });

        it('零声母：u: 是 ü，u:1 是 ǖ', () => {
            expect(markTones('u:')).to.equal('ü');
            expect(markTones('u:1')).to.equal('ǖ');
            expect(markTones('u:4')).to.equal('ǜ');
        });

        it('冒号与裸写能在同一段里并排', () => {
            expect(markTones('ju1和ju:1')).to.equal('jū和jǖ');
            expect(markTones('jv1和ju:1')).to.equal('jū和jǖ');
        });

        it('冒号前的 v 与 u 等价', () => {
            expect(markTones('jv:1')).to.equal('jǖ');
            expect(markTones('jv:1和ju:1')).to.equal('jǖ和jǖ');
            expect(markTones('jvan:1')).to.equal('jüān');
        });

        it('音节里没有 u 时不猜，原样返回', () => {
            expect(markTones('ji:1')).to.equal('ji:1');
            expect(markTones('ma:1')).to.equal('ma:1');
        });

        it('冒号写在哪儿就是要哪儿的 ü，不看声母', () => {
            expect(markTones('gu:1')).to.equal('gǖ');
            expect(markTones('u:e1')).to.equal('üē');
        });

        it('词表给不出 ü 时原样', () => {
            expect(markTones('shui:3')).to.equal('shui:3');
            expect(markTones('uang:1')).to.equal('uang:1');
        });

        it('空格模式下同样可用', () => {
            expect(markTones('ju:1 ju1 jv1')).to.equal('jǖ jū jū');
        });
    });

    describe('n/l 不参与自动投影', () => {
        it('nv / nu 保持原意', () => {
            expect(markTones('nv3')).to.equal('nǚ');
            expect(markTones('nu3')).to.equal('nǔ');
            expect(markTones('lv4')).to.equal('lǜ');
            expect(markTones('lu4')).to.equal('lù');
        });
    });

    describe('边界：不误伤非拼音内容', () => {
        it('英文单词原样保留', () => {
            expect(markTones('hello world')).to.equal('hello world');
        });

        it('英文单词后面紧跟的拼音仍然转换', () => {
            expect(markTones('hello jv1')).to.equal('hello jū');
        });

        it('前面是 ASCII 字母时不切开（abcju1）', () => {
            expect(markTones('abcju1')).to.equal('abcju1');
        });

        it('后面是 ASCII 字母时不切开（jv1abc）', () => {
            expect(markTones('jv1abc')).to.equal('jv1abc');
            expect(markTones('ju1x')).to.equal('ju1x');
        });

        it('下划线与数字也算词字符：标识符样子的串不动', () => {
            expect(markTones('abc_ju1')).to.equal('abc_ju1');
            expect(markTones('ni3_hao3')).to.equal('ni3_hao3');
            expect(markTones('3ju1')).to.equal('3ju1');
        });

        it('非法声调 6-9 不转换', () => {
            expect(markTones('ma6 ma9')).to.equal('ma6 ma9');
        });

        it('单独一个字母不当作拼音', () => {
            expect(markTones('在j后面')).to.equal('在j后面');
        });

        it('括号、引号、标点都能作为边界', () => {
            expect(markTones('（jv1）「ju1」,jv1.')).to.equal('（jū）「jū」,jū.');
        });

        it('空串与纯中文不变', () => {
            expect(markTones('')).to.equal('');
            expect(markTones('汉语拼音')).to.equal('汉语拼音');
        });
    });

    describe('混排不改变片段自己的结果', () => {
        it('字面与规范两种写法在整句里各自成立（32 键 × 5 声调）', () => {
            for (let i = 0; i < LITERAL_KEYS.length; i++) {
                const literal = LITERAL_KEYS[i];
                const canonical = CANONICAL_KEYS[i];
                for (const tone of TONES) {
                    // 裸写一律走规范形式
                    expect(markTones(canonical + tone), canonical + tone)
                        .to.equal(expectedValue(canonical, tone));
                    expect(markTones(literal + tone), literal + tone)
                        .to.equal(expectedValue(canonical, tone));
                    // 冒号才拿字面形式；轻声（0）没有带调字形，跳过
                    if (tone > 0) {
                        expect(markTones(canonical + ':' + tone), canonical + ':' + tone)
                            .to.equal(expectedValue(literal, tone));
                    }
                }
            }
        });

        it('全表扫描：前后加汉字不改变片段的结果', () => {
            // 词表里每个键都能被输入语法命中（纯小写字母，或 e^），所以整表都扫。
            for (const key of Object.keys(dict)) {
                for (const tone of TONES) {
                    const input = key + tone;
                    expect(markTones(`前缀${input}后缀`), input)
                        .to.equal(`前缀${markTones(input)}后缀`);
                }
            }
        });
    });
});
