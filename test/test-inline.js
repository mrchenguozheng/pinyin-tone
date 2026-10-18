// test/test-inline.js
// 中文与拼音混排时的整句转换，以及用冒号表示 ü 两点的写法。
//
// 与 toPinyinTones 的差别只在分词：那边按空格切，一个 token 要么整串是拼音、
// 要么原样返回；这边在整段文字里扫，只替换能成词的片段，其余字符逐字保留。
//
// 两种标记：
//   裸写 ju1 / jv1  -> 规范形式 jū
//   ju:1            -> 冒号代表 u 上面那两点，输出 jǖ
// 冒号只对 ü 真正能出现的声母生效（n/l/j/q/x/y 与零声母 u），其余原样返回。
import { expect } from 'chai';
import toPinyinTones, { toPinyinTonesInline } from '../v2/index.js';
import dict from '../v2/dict.js';

const HEADS = ['j', 'q', 'x', 'y'];
const FINALS = ['v', 've', 'van', 'vn', 'vr', 'ver', 'vanr', 'vnr'];
const LITERAL_KEYS = HEADS.flatMap((h) => FINALS.map((f) => h + f));
const CANONICAL_KEYS = LITERAL_KEYS.map((k) => k.replace('v', 'u'));
const TONES = [0, 1, 2, 3, 4];

/** 只保留汉字，用于校验非拼音内容没被改动 */
const hanOnly = (s) => s.replace(/[^\u4e00-\u9fff]/g, '');

describe('v2 混排：toPinyinTonesInline', () => {
    describe('核心用例：一句里并排两种写法', () => {
        const input = 'ju是规范写法，而ju:1是不规范写法，因为u:1在j后面要省略上面的两点';
        const output = 'ju是规范写法，而jǖ是不规范写法，因为ǖ在j后面要省略上面的两点';

        it('裸写保持原样，冒号转成字面形式', () => {
            expect(toPinyinTonesInline(input)).to.equal(output);
        });

        it('中文与标点逐字保留', () => {
            expect(hanOnly(toPinyinTonesInline(input))).to.equal(hanOnly(input));
        });

        it('输出再跑一次不再变化（幂等）', () => {
            const once = toPinyinTonesInline(input);
            expect(toPinyinTonesInline(once)).to.equal(once);
        });

        it('输入里不需要出现任何 ü 系字符', () => {
            expect(/[üǖǘǚǜ]/.test(input), '输入不该含 ü').to.equal(false);
        });
    });

    describe('裸写：默认规范形式', () => {
        it('ju1 与 jv1 都输出 jū', () => {
            expect(toPinyinTonesInline('ju1')).to.equal('jū');
            expect(toPinyinTonesInline('jv1')).to.equal('jū');
        });

        it('同一句里两种写法结果相同', () => {
            expect(toPinyinTonesInline('ju1和jv1')).to.equal('jū和jū');
            expect(toPinyinTonesInline('jue2和jve2')).to.equal('jué和jué');
            expect(toPinyinTonesInline('juan1和jvan1')).to.equal('juān和juān');
        });
    });

    describe('冒号：u 上面那两点', () => {
        it('ju:1 输出 jǖ，而裸 ju1 仍是 jū', () => {
            expect(toPinyinTonesInline('ju:1')).to.equal('jǖ');
            expect(toPinyinTonesInline('ju1')).to.equal('jū');
        });

        it('四个可省两点的韵母都支持', () => {
            expect(toPinyinTonesInline('ju:1')).to.equal('jǖ');
            expect(toPinyinTonesInline('jue:2')).to.equal('jüé');
            expect(toPinyinTonesInline('juan:1')).to.equal('jüān');
            expect(toPinyinTonesInline('jun:4')).to.equal('jǜn');
        });

        it('q/x/y 同样生效', () => {
            expect(toPinyinTonesInline('qu:1')).to.equal('qǖ');
            expect(toPinyinTonesInline('xue:3')).to.equal('xüě');
            expect(toPinyinTonesInline('yun:2')).to.equal('yǘn');
        });

        it('n/l 的 ü 也能用冒号写出来', () => {
            expect(toPinyinTonesInline('nu:3')).to.equal('nǚ');
            expect(toPinyinTonesInline('lu:4')).to.equal('lǜ');
            // 不带冒号时仍是普通 u
            expect(toPinyinTonesInline('nu3')).to.equal('nǔ');
            expect(toPinyinTonesInline('lu4')).to.equal('lù');
        });

        it('零声母：u: 是 ü，u:1 是 ǖ', () => {
            expect(toPinyinTonesInline('u:')).to.equal('ü');
            expect(toPinyinTonesInline('u:1')).to.equal('ǖ');
            expect(toPinyinTonesInline('u:4')).to.equal('ǜ');
        });

        it('冒号与裸写能在同一段里并排', () => {
            expect(toPinyinTonesInline('ju1和ju:1')).to.equal('jū和jǖ');
            expect(toPinyinTonesInline('jv1和ju:1')).to.equal('jū和jǖ');
        });

        it('冒号前的 v 与 u 等价', () => {
            expect(toPinyinTonesInline('jv:1')).to.equal('jǖ');
            expect(toPinyinTonesInline('jv:1和ju:1')).to.equal('jǖ和jǖ');
            expect(toPinyinTonesInline('jvan:1')).to.equal('jüān');
        });

        it('音节里没有 u 时不猜，原样返回', () => {
            expect(toPinyinTonesInline('ji:1')).to.equal('ji:1');
            expect(toPinyinTonesInline('ma:1')).to.equal('ma:1');
        });

        it('ü 不能出现的声母不处理，避免造出 gǖ', () => {
            expect(toPinyinTonesInline('gu:1')).to.equal('gu:1');
            expect(toPinyinTonesInline('shui:3')).to.equal('shui:3');
            expect(toPinyinTonesInline('uang:1')).to.equal('uang:1');
        });

        it('空格模式下同样可用', () => {
            expect(toPinyinTones('ju:1 ju1 jv1')).to.equal('jǖ jū jū');
        });
    });

    describe('n/l 不参与自动投影', () => {
        it('nv / nu 保持原意', () => {
            expect(toPinyinTonesInline('nv3')).to.equal('nǚ');
            expect(toPinyinTonesInline('nu3')).to.equal('nǔ');
            expect(toPinyinTonesInline('lv4')).to.equal('lǜ');
            expect(toPinyinTonesInline('lu4')).to.equal('lù');
        });
    });

    describe('边界：不误伤非拼音内容', () => {
        it('英文单词原样保留', () => {
            expect(toPinyinTonesInline('hello world')).to.equal('hello world');
        });

        it('英文单词后面紧跟的拼音仍然转换', () => {
            expect(toPinyinTonesInline('hello jv1')).to.equal('hello jū');
        });

        it('前面是 ASCII 字母时不切开（abcju1）', () => {
            expect(toPinyinTonesInline('abcju1')).to.equal('abcju1');
        });

        it('后面是 ASCII 字母时不切开（jv1abc）', () => {
            expect(toPinyinTonesInline('jv1abc')).to.equal('jv1abc');
            expect(toPinyinTonesInline('ju1x')).to.equal('ju1x');
        });

        it('非法声调 6-9 不转换', () => {
            expect(toPinyinTonesInline('ma6 ma9')).to.equal('ma6 ma9');
        });

        it('单独一个字母不当作拼音', () => {
            expect(toPinyinTonesInline('在j后面')).to.equal('在j后面');
        });

        it('括号、引号、标点都能作为边界', () => {
            expect(toPinyinTonesInline('（jv1）「ju1」,jv1.')).to.equal('（jū）「jū」,jū.');
        });

        it('空串与纯中文不变', () => {
            expect(toPinyinTonesInline('')).to.equal('');
            expect(toPinyinTonesInline('汉语拼音')).to.equal('汉语拼音');
        });
    });

    describe('与 toPinyinTones 保持同源', () => {
        it('单个 token 的结果与分别调用一致（32 键 × 5 声调）', () => {
            for (let i = 0; i < LITERAL_KEYS.length; i++) {
                const literal = LITERAL_KEYS[i];
                const canonical = CANONICAL_KEYS[i];
                for (const tone of TONES) {
                    // 裸写一律走规范形式
                    expect(toPinyinTonesInline(canonical + tone), canonical + tone)
                        .to.equal(dict[canonical][tone]);
                    expect(toPinyinTonesInline(literal + tone), literal + tone)
                        .to.equal(dict[canonical][tone]);
                    // 冒号才拿字面形式；轻声（0）没有带调字形，跳过
                    if (tone > 0) {
                        expect(toPinyinTonesInline(canonical + ':' + tone), canonical + ':' + tone)
                            .to.equal(dict[literal][tone]);
                    }
                }
            }
        });

        it('全表扫描：混排里的裸写与 toPinyinTones 逐条一致', () => {
            // 只取能被 ASCII 输入命中的键；词表里另有 'e^' 与 'ü' 两个键，
            // 正则永远匹配不到它们，属于无法输入的死数据，此处不覆盖。
            for (const key of Object.keys(dict).filter((k) => /^[a-z]+$/.test(k))) {
                for (const tone of TONES) {
                    const input = key + tone;
                    expect(toPinyinTonesInline(`前缀${input}后缀`), input)
                        .to.equal(`前缀${toPinyinTones(input)}后缀`);
                }
            }
        });
    });
});
