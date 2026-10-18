// test/test-mixed.js
// 中文与拼音混排时的整句转换，以及用冒号表示 ü 两点的写法。
//
// 入口只有一个：在整段文字里扫候选片段，只替换能成词的片段，
// 其余字符（汉字、标点、空白）逐字保留。
//
// 两种标记：
//   裸写 ju1 / jv1  -> 规范形式 jū
//   ju:1            -> 冒号代表 u 上面那两点，输出 jǖ
// 冒号不看声母允不允许：gu:1 就是 gǖ、u:e1 就是 üē。落空的只有三类 ——
// 音节里没有 u/v、落点是 u 但词表把换出的 v 当辅音、冒号不在两个合法位置上。
// （具体哪个键能落点由 test-two-spellings.js 按 32 键 × 5 声调整表扫，这里只测整句。）
import { expect } from 'chai';
import {markTones} from '../lib/index.js';
import dict from '../lib/dict.js';

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
    });

    // 裸写的默认形式（32 字面键 + 32 规范键 × 5 声调）、冒号的落点与位置、
    // n/l 的两点由 test-two-spellings.js 逐格负责 —— 这里不再把同一批输入抄一遍。
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
            // 6 不在片段字符集里，它自己就是边界；ni3 粘在它左边（数字算词字符）→
            // 整段哪一段都不动。这是「不吞字符」这条规则的直接后果，不是额外特判。
            expect(markTones('ni3ma6')).to.equal('ni3ma6');
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

    // 32 个 jqxy+ü 字面键逐声调的取值由 test-two-spellings.js 负责；
    // 这里只问一件事：片段前后多了汉字，片段自己的结果不变。
    describe('混排不改变片段自己的结果', () => {
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
