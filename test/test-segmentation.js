// test/test-segmentation.js
// 分词层：先在整段里取出候选片段，片段内部再按声调数字切成音节。
//
// 切分的锚点是声调数字 —— 拼音连写里唯一可靠的分隔信息。
// 没有数字的连写（hanyu3pin1yin1 里的 "hanyu"）不猜，整个片段原样返回。
// 片段里任何一段认不出来也是原样：宁可少转，不出半截。
//
// 输出保持输入的分隔方式：连写的音节不补空格（ni3hao3 -> nǐhǎo），
// 输入里写了空格就还是空格（ni3 hao3 -> nǐ hǎo），标点原样留在原位。
// 首尾空白也不裁 —— 转换只改字母和声调。
import { expect } from 'chai';
import markTones from '../lib/index.js';

describe('分词：连写音节', () => {
    it('声调数字就是分隔符，音节之间不补空格', () => {
        expect(markTones('ni3hao3')).to.equal('nǐhǎo');
        expect(markTones('wo3ai4ni3')).to.equal('wǒàinǐ');
        expect(markTones('han4yu3pin1yin1')).to.equal('hànyǔpīnyīn');
    });

    it('末尾音节没有声调也能切（轻声）', () => {
        expect(markTones('ni3hao')).to.equal('nǐhao');
        expect(markTones('ni3hao3ma5')).to.equal('nǐhǎoma');
    });

    it('输入的空白就是输出的空白', () => {
        expect(markTones('ni3 hao3')).to.equal('nǐ hǎo');
        expect(markTones('ni3  hao3')).to.equal('nǐ  hǎo');
        // 首尾空白不裁：只改字母和声调，排版归调用方
        expect(markTones('  ni3 hao3  ')).to.equal('  nǐ hǎo  ');
    });

    it('连写与带空格只差空格本身', () => {
        for (const s of ['ni3hao3', 'wo3ai4ni3', 'han4yu3pin1yin1', 'xian4dai4hua4']) {
            const spaced = s.replace(/([0-9])/g, '$1 ').trim();
            expect(markTones(s), s).to.equal(markTones(spaced).replace(/ /g, ''));
        }
    });

    it('冒号标记在连写里同样生效', () => {
        expect(markTones('ni3jv:1')).to.equal('nǐjǖ');
        expect(markTones('ni3ju:1')).to.equal('nǐjǖ');
        expect(markTones('ni3nve4')).to.equal('nǐnüè');
    });

    it('冒号后面的字母属于同一音节', () => {
        expect(markTones('lu:e4')).to.equal('lüè');
        expect(markTones('nu:e4')).to.equal('nüè');
        expect(markTones('lu:e')).to.equal('lüe');
        expect(markTones('ni3lu:e4')).to.equal('nǐlüè');
    });

    it('规范拼写仍然是默认：连写里的 jv 也要省两点', () => {
        expect(markTones('ni3jv1')).to.equal('nǐjū');
        expect(markTones('ni3jvan1')).to.equal('nǐjuān');
    });
});

describe('分词：标点只当边界', () => {
    it('标点原样保留，两侧各转各的', () => {
        expect(markTones('ni3,hao3')).to.equal('nǐ,hǎo');
        expect(markTones('ni3/hao3')).to.equal('nǐ/hǎo');
        expect(markTones('na3-li3')).to.equal('nǎ-lǐ');
        expect(markTones('hao3!')).to.equal('hǎo!');
        expect(markTones('“hao3”')).to.equal('“hǎo”');
        expect(markTones('(hao3)')).to.equal('(hǎo)');
    });

    it('多个标点不会被合并或吞掉', () => {
        expect(markTones('ni3...hao3')).to.equal('nǐ...hǎo');
        expect(markTones('ni3—hao3')).to.equal('nǐ—hǎo');
        expect(markTones('ni3,,hao3')).to.equal('nǐ,,hǎo');
    });

    it('token 内部的换行与制表符也当边界', () => {
        expect(markTones('ni3\nhao3')).to.equal('nǐ\nhǎo');
        expect(markTones('ni3\thao3')).to.equal('nǐ\thǎo');
        expect(markTones('ni3\thao3\two3')).to.equal('nǐ\thǎo\twǒ');
    });

    it('纯符号 token 原样返回', () => {
        for (const s of ['/', '--', '...', ',', '!']) {
            expect(markTones(s), s).to.equal(s);
        }
    });
});

describe('分词：认不全就整串原样', () => {
    it('中间夹着不认识的音节', () => {
        expect(markTones('a1b2c3')).to.equal('a1b2c3');
        expect(markTones('ni3b2hao3')).to.equal('ni3b2hao3');
        expect(markTones('a1b2c3d4')).to.equal('a1b2c3d4');
    });

    it('没有声调数字做锚点，切不开', () => {
        expect(markTones('hanyu3pin1yin1')).to.equal('hanyu3pin1yin1');
        expect(markTones('china')).to.equal('china');
        expect(markTones('nihao')).to.equal('nihao');
    });

    it('legacy 儿化写法不猜', () => {
        expect(markTones('hua1r')).to.equal('hua1r');
        expect(markTones('hua1r5')).to.equal('hua1r5');
        expect(markTones('wan2r')).to.equal('wan2r');
    });

    it('非法声调不猜', () => {
        expect(markTones('ma6')).to.equal('ma6');
        expect(markTones('ma33')).to.equal('ma33');
        expect(markTones('ma-3')).to.equal('ma-3');
    });

    it('冒号指定了 ü 就不再看声母是否允许', () => {
        expect(markTones('gu:1')).to.equal('gǖ');
        expect(markTones('u:e1')).to.equal('üē');
        expect(markTones('shv:3')).to.equal('shǚ');
    });

    it('冒号落不了点时才整串原样', () => {
        expect(markTones('ma:1')).to.equal('ma:1');
        expect(markTones('ha:o3')).to.equal('ha:o3');
        expect(markTones('ji:1')).to.equal('ji:1');
        expect(markTones('shui:3')).to.equal('shui:3');
    });

    it('大小写混排整段不动', () => {
        expect(markTones('Hao3')).to.equal('Hao3');
        expect(markTones('Ni3hao3')).to.equal('Ni3hao3');
        expect(markTones('Zhong1Guo2')).to.equal('Zhong1Guo2');
        expect(markTones('hAo3')).to.equal('hAo3');
    });
});

// 混排（汉字 / 英文单词 / 下划线相邻）由 test-mixed.js 专测，这里只管分词本身。

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

describe('分词：字母守恒', () => {
    // 转换只消费声调数字、只替换字母，不应该吃掉任何字母
    const letters = (s) => s
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^A-Za-z]/g, '')
        .toLowerCase()
        .replace(/v/g, 'u');

    const inputs = [
        'ni3hao3', 'ni3,hao3', 'ni3...hao3', 'a1b2c3', 'hua1r', 'ma6',
        'lu:e4', 'Hao3', 'ni3我', 'han4yu3pin1yin1', 'hanyu3pin1yin1',
        'ni3jv:1', 'na3-li3', 'ni3\thao3', 'jvan1nv3',
    ];

    it('每个输入的字母序列在输出里原样保留', () => {
        for (const s of inputs) {
            expect(letters(markTones(s)), s).to.equal(letters(s));
        }
    });
});

describe('分词：冒号在连写与标点旁同样生效', () => {
    it('同一串里两种拼写并存', () => {
        expect(markTones('ni3jv1')).to.equal('nǐjū');
        expect(markTones('ni3ju:1')).to.equal('nǐjǖ');
    });

    it('标点两侧也保持一致', () => {
        expect(markTones('ni3,jvan1')).to.equal('nǐ,juān');
        expect(markTones('ni3,jvan:1')).to.equal('nǐ,jüān');
    });
});
