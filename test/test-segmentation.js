// test/test-segmentation.js
// 连写切分里，test-regex-anchoring.js 表达不了的三件事：
//   1. 连写与分开写的位置等价性 —— 笛卡尔积全扫，不是抽样
//   2. 整段没有一个声调数字时原样返回，不猜音节边界
//   3. 冒号在连写内部同样成立（那边只在整 token 的位置测）
//
// 其余规则由 test-regex-anchoring.js 逐条钉住：标点当边界、空白、大小写、
// 非法声调、儿化、冒号的落点。这里不再把同一批输入抄第二遍。
import { expect } from 'chai';
import {markTones} from '../lib/index.js';

describe('分词：连写等价于分开写', () => {
    // ng 是唯一没有韵母的键（表里 5 格都是 ng），连写时无法从字母流里切出来，
    // 因此不在这一组里 —— 它属于「没有数字锚点就切不开」的已知限制。
    const SYLLABLES = [
        'ni3', 'hao3', 'wo3', 'ai4', 'han4', 'yu3', 'pin1', 'yin1',
        'xian4', 'dai4', 'hua4', 'nv3', 'lve4', 'jue2', 'jvan1', 'shui3', 'er2',
    ];

    it('任意两个音节连写，结果等于两者分开写后去掉空格', () => {
        const bad = [];
        for (const a of SYLLABLES) {
            for (const b of SYLLABLES) {
                const together = markTones(a + b);
                const apart = markTones(a + ' ' + b).replace(/ /g, '');
                if (together !== apart) bad.push(`${a + b}: ${together} !== ${apart}`);
            }
        }
        expect(bad).to.deep.equal([]);
    });

    it('三个音节连写也一样', () => {
        expect(markTones('ni3hao3ma5')).to.equal(markTones('ni3 hao3 ma5').replace(/ /g, ''));
        expect(markTones('wo3ai4ni3')).to.equal(markTones('wo3 ai4 ni3').replace(/ /g, ''));
    });
});

describe('分词：没有数字就切不开', () => {
    it('整段没有一个声调数字时不猜边界', () => {
        expect(markTones('china')).to.equal('china');
        expect(markTones('nihao')).to.equal('nihao');
    });
});

describe('分词：冒号在连写里', () => {
    it('相邻音节的冒号不会串到别人身上', () => {
        expect(markTones('ni3jv:1')).to.equal('nǐjǖ');
        expect(markTones('ni3ju:1')).to.equal('nǐjǖ');
        expect(markTones('ni3nve4')).to.equal('nǐnüè');
    });

    it('冒号后的字母仍属同一音节', () => {
        expect(markTones('ni3lu:e4')).to.equal('nǐlüè');
    });

    it('裸写与冒号在连写里各按各的拼写', () => {
        expect(markTones('ni3jv1')).to.equal('nǐjū');
        expect(markTones('ni3jvan1')).to.equal('nǐjuān');
        expect(markTones('ni3,jvan:1')).to.equal('nǐ,jüān');
    });
});
