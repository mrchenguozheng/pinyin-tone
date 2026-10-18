// test/test-inline.js
// 中文与拼音混排时的整句转换，以及用冒号表示 ü 两点的写法。
//
// 与 toToneMarks 的差别只在分词：那边按空格切，一个 token 要么整串是拼音、
// 要么原样返回；这边在整段文字里扫，只替换能成词的片段，其余字符逐字保留。
//
// 两种标记：
//   裸写 ju1 / jv1  -> 规范形式 jū
//   ju:1            -> 冒号代表 u 上面那两点，输出 jǖ
// 冒号只对 ü 真正能出现的声母生效（n/l/j/q/x/y 与零声母 u），其余原样返回。
import { expect } from 'chai';
import toToneMarks, { toToneMarksInText } from '../lib/index.js';
import dict from '../lib/dict.js';
import { expectedValue } from './support/dict-values.js';

const HEADS = ['j', 'q', 'x', 'y'];
const FINALS = ['v', 've', 'van', 'vn', 'vr', 'ver', 'vanr', 'vnr'];
const LITERAL_KEYS = HEADS.flatMap((h) => FINALS.map((f) => h + f));
const CANONICAL_KEYS = LITERAL_KEYS.map((k) => k.replace('v', 'u'));
const TONES = [0, 1, 2, 3, 4];

/** 只保留汉字，用于校验非拼音内容没被改动 */
const hanOnly = (s) => s.replace(/[^\u4e00-\u9fff]/g, '');

describe('混排：toToneMarksInText', () => {
    describe('核心用例：一句里并排两种写法', () => {
        const input = 'ju是规范写法，而ju:1是不规范写法，因为u:1在j后面要省略上面的两点';
        const output = 'ju是规范写法，而jǖ是不规范写法，因为ǖ在j后面要省略上面的两点';

        it('裸写保持原样，冒号转成字面形式', () => {
            expect(toToneMarksInText(input)).to.equal(output);
        });

        it('中文与标点逐字保留', () => {
            expect(hanOnly(toToneMarksInText(input))).to.equal(hanOnly(input));
        });

        it('输出再跑一次不再变化（幂等）', () => {
            const once = toToneMarksInText(input);
            expect(toToneMarksInText(once)).to.equal(once);
        });

        it('输入里不需要出现任何 ü 系字符', () => {
            expect(/[üǖǘǚǜ]/.test(input), '输入不该含 ü').to.equal(false);
        });
    });

    describe('裸写：默认规范形式', () => {
        it('ju1 与 jv1 都输出 jū', () => {
            expect(toToneMarksInText('ju1')).to.equal('jū');
            expect(toToneMarksInText('jv1')).to.equal('jū');
        });

        it('同一句里两种写法结果相同', () => {
            expect(toToneMarksInText('ju1和jv1')).to.equal('jū和jū');
            expect(toToneMarksInText('jue2和jve2')).to.equal('jué和jué');
            expect(toToneMarksInText('juan1和jvan1')).to.equal('juān和juān');
        });
    });

    describe('冒号：u 上面那两点', () => {
        it('ju:1 输出 jǖ，而裸 ju1 仍是 jū', () => {
            expect(toToneMarksInText('ju:1')).to.equal('jǖ');
            expect(toToneMarksInText('ju1')).to.equal('jū');
        });

        it('四个可省两点的韵母都支持', () => {
            expect(toToneMarksInText('ju:1')).to.equal('jǖ');
            expect(toToneMarksInText('jue:2')).to.equal('jüé');
            expect(toToneMarksInText('juan:1')).to.equal('jüān');
            expect(toToneMarksInText('jun:4')).to.equal('jǜn');
        });

        it('q/x/y 同样生效', () => {
            expect(toToneMarksInText('qu:1')).to.equal('qǖ');
            expect(toToneMarksInText('xue:3')).to.equal('xüě');
            expect(toToneMarksInText('yun:2')).to.equal('yǘn');
        });

        it('n/l 的 ü 也能用冒号写出来', () => {
            expect(toToneMarksInText('nu:3')).to.equal('nǚ');
            expect(toToneMarksInText('lu:4')).to.equal('lǜ');
            // 不带冒号时仍是普通 u
            expect(toToneMarksInText('nu3')).to.equal('nǔ');
            expect(toToneMarksInText('lu4')).to.equal('lù');
        });

        it('零声母：u: 是 ü，u:1 是 ǖ', () => {
            expect(toToneMarksInText('u:')).to.equal('ü');
            expect(toToneMarksInText('u:1')).to.equal('ǖ');
            expect(toToneMarksInText('u:4')).to.equal('ǜ');
        });

        it('冒号与裸写能在同一段里并排', () => {
            expect(toToneMarksInText('ju1和ju:1')).to.equal('jū和jǖ');
            expect(toToneMarksInText('jv1和ju:1')).to.equal('jū和jǖ');
        });

        it('冒号前的 v 与 u 等价', () => {
            expect(toToneMarksInText('jv:1')).to.equal('jǖ');
            expect(toToneMarksInText('jv:1和ju:1')).to.equal('jǖ和jǖ');
            expect(toToneMarksInText('jvan:1')).to.equal('jüān');
        });

        it('音节里没有 u 时不猜，原样返回', () => {
            expect(toToneMarksInText('ji:1')).to.equal('ji:1');
            expect(toToneMarksInText('ma:1')).to.equal('ma:1');
        });

        it('冒号写在哪儿就是要哪儿的 ü，不看声母', () => {
            expect(toToneMarksInText('gu:1')).to.equal('gǖ');
            expect(toToneMarksInText('u:e1')).to.equal('üē');
        });

        it('词表给不出 ü 时原样', () => {
            expect(toToneMarksInText('shui:3')).to.equal('shui:3');
            expect(toToneMarksInText('uang:1')).to.equal('uang:1');
        });

        it('空格模式下同样可用', () => {
            expect(toToneMarks('ju:1 ju1 jv1')).to.equal('jǖ jū jū');
        });
    });

    describe('n/l 不参与自动投影', () => {
        it('nv / nu 保持原意', () => {
            expect(toToneMarksInText('nv3')).to.equal('nǚ');
            expect(toToneMarksInText('nu3')).to.equal('nǔ');
            expect(toToneMarksInText('lv4')).to.equal('lǜ');
            expect(toToneMarksInText('lu4')).to.equal('lù');
        });
    });

    describe('边界：不误伤非拼音内容', () => {
        it('英文单词原样保留', () => {
            expect(toToneMarksInText('hello world')).to.equal('hello world');
        });

        it('英文单词后面紧跟的拼音仍然转换', () => {
            expect(toToneMarksInText('hello jv1')).to.equal('hello jū');
        });

        it('前面是 ASCII 字母时不切开（abcju1）', () => {
            expect(toToneMarksInText('abcju1')).to.equal('abcju1');
        });

        it('后面是 ASCII 字母时不切开（jv1abc）', () => {
            expect(toToneMarksInText('jv1abc')).to.equal('jv1abc');
            expect(toToneMarksInText('ju1x')).to.equal('ju1x');
        });

        it('非法声调 6-9 不转换', () => {
            expect(toToneMarksInText('ma6 ma9')).to.equal('ma6 ma9');
        });

        it('单独一个字母不当作拼音', () => {
            expect(toToneMarksInText('在j后面')).to.equal('在j后面');
        });

        it('括号、引号、标点都能作为边界', () => {
            expect(toToneMarksInText('（jv1）「ju1」,jv1.')).to.equal('（jū）「jū」,jū.');
        });

        it('空串与纯中文不变', () => {
            expect(toToneMarksInText('')).to.equal('');
            expect(toToneMarksInText('汉语拼音')).to.equal('汉语拼音');
        });
    });

    describe('与 toToneMarks 保持同源', () => {
        it('单个 token 的结果与分别调用一致（32 键 × 5 声调）', () => {
            for (let i = 0; i < LITERAL_KEYS.length; i++) {
                const literal = LITERAL_KEYS[i];
                const canonical = CANONICAL_KEYS[i];
                for (const tone of TONES) {
                    // 裸写一律走规范形式
                    expect(toToneMarksInText(canonical + tone), canonical + tone)
                        .to.equal(expectedValue(canonical, tone));
                    expect(toToneMarksInText(literal + tone), literal + tone)
                        .to.equal(expectedValue(canonical, tone));
                    // 冒号才拿字面形式；轻声（0）没有带调字形，跳过
                    if (tone > 0) {
                        expect(toToneMarksInText(canonical + ':' + tone), canonical + ':' + tone)
                            .to.equal(expectedValue(literal, tone));
                    }
                }
            }
        });

        it('全表扫描：混排里的裸写与 toToneMarks 逐条一致', () => {
            // 词表里每个键都能被输入语法命中（纯小写字母，或 e^），所以整表都扫。
            for (const key of Object.keys(dict)) {
                for (const tone of TONES) {
                    const input = key + tone;
                    expect(toToneMarksInText(`前缀${input}后缀`), input)
                        .to.equal(`前缀${toToneMarks(input)}后缀`);
                }
            }
        });
    });
});
