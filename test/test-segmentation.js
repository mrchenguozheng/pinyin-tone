// test/test-segmentation.js
// 分词层：一个 token 可以由若干音节连写而成，也可以夹着 ASCII 标点。
//
// 切分的锚点是声调数字 —— 拼音连写里唯一可靠的分隔信息。
// 没有数字的连写（hanyu3pin1yin1 里的 "hanyu"）不猜，整串原样返回。
// 任何一段认不出来，也是整串原样：宁可少转，不出半截。
//
// 输出保持输入的分隔方式：连写的音节不补空格（ni3hao3 -> nǐhǎo），
// 输入里写了空格就还是空格（ni3 hao3 -> nǐ hǎo），标点原样留在原位。
import { expect } from 'chai';
import toToneMarks, { toToneMarksInText } from '../lib/index.js';

describe('分词：连写音节', () => {
    it('声调数字就是分隔符，音节之间不补空格', () => {
        expect(toToneMarks('ni3hao3')).to.equal('nǐhǎo');
        expect(toToneMarks('wo3ai4ni3')).to.equal('wǒàinǐ');
        expect(toToneMarks('han4yu3pin1yin1')).to.equal('hànyǔpīnyīn');
    });

    it('末尾音节没有声调也能切（轻声）', () => {
        expect(toToneMarks('ni3hao')).to.equal('nǐhao');
        expect(toToneMarks('ni3hao3ma5')).to.equal('nǐhǎoma');
    });

    it('输入的空白就是输出的空白', () => {
        expect(toToneMarks('ni3 hao3')).to.equal('nǐ hǎo');
        expect(toToneMarks('ni3  hao3')).to.equal('nǐ  hǎo');
    });

    it('连写与带空格只差空格本身', () => {
        for (const s of ['ni3hao3', 'wo3ai4ni3', 'han4yu3pin1yin1', 'xian4dai4hua4']) {
            const spaced = s.replace(/([0-9])/g, '$1 ').trim();
            expect(toToneMarks(s), s).to.equal(toToneMarks(spaced).replace(/ /g, ''));
        }
    });

    it('冒号标记在连写里同样生效', () => {
        expect(toToneMarks('ni3jv:1')).to.equal('nǐjǖ');
        expect(toToneMarks('ni3ju:1')).to.equal('nǐjǖ');
        expect(toToneMarks('ni3nve4')).to.equal('nǐnüè');
    });

    it('冒号后面的字母属于同一音节', () => {
        expect(toToneMarks('lu:e4')).to.equal('lüè');
        expect(toToneMarks('nu:e4')).to.equal('nüè');
        expect(toToneMarks('lu:e')).to.equal('lüe');
        expect(toToneMarks('ni3lu:e4')).to.equal('nǐlüè');
    });

    it('规范拼写仍然是默认：连写里的 jv 也要省两点', () => {
        expect(toToneMarks('ni3jv1')).to.equal('nǐjū');
        expect(toToneMarks('ni3jvan1')).to.equal('nǐjuān');
    });
});

describe('分词：标点只当边界', () => {
    it('标点原样保留，两侧各转各的', () => {
        expect(toToneMarks('ni3,hao3')).to.equal('nǐ,hǎo');
        expect(toToneMarks('ni3/hao3')).to.equal('nǐ/hǎo');
        expect(toToneMarks('na3-li3')).to.equal('nǎ-lǐ');
        expect(toToneMarks('hao3!')).to.equal('hǎo!');
        expect(toToneMarks('“hao3”')).to.equal('“hǎo”');
        expect(toToneMarks('(hao3)')).to.equal('(hǎo)');
    });

    it('多个标点不会被合并或吞掉', () => {
        expect(toToneMarks('ni3...hao3')).to.equal('nǐ...hǎo');
        expect(toToneMarks('ni3—hao3')).to.equal('nǐ—hǎo');
        expect(toToneMarks('ni3,,hao3')).to.equal('nǐ,,hǎo');
    });

    it('token 内部的换行与制表符也当边界', () => {
        expect(toToneMarks('ni3\nhao3')).to.equal('nǐ\nhǎo');
        expect(toToneMarks('ni3\thao3')).to.equal('nǐ\thǎo');
        expect(toToneMarks('ni3\thao3\two3')).to.equal('nǐ\thǎo\twǒ');
    });

    it('纯符号 token 原样返回', () => {
        for (const s of ['/', '--', '...', ',', '!']) {
            expect(toToneMarks(s), s).to.equal(s);
        }
    });
});

describe('分词：认不全就整串原样', () => {
    it('中间夹着不认识的音节', () => {
        expect(toToneMarks('a1b2c3')).to.equal('a1b2c3');
        expect(toToneMarks('ni3b2hao3')).to.equal('ni3b2hao3');
        expect(toToneMarks('a1b2c3d4')).to.equal('a1b2c3d4');
    });

    it('没有声调数字做锚点，切不开', () => {
        expect(toToneMarks('hanyu3pin1yin1')).to.equal('hanyu3pin1yin1');
        expect(toToneMarks('china')).to.equal('china');
        expect(toToneMarks('nihao')).to.equal('nihao');
    });

    it('legacy 儿化写法不猜', () => {
        expect(toToneMarks('hua1r')).to.equal('hua1r');
        expect(toToneMarks('hua1r5')).to.equal('hua1r5');
        expect(toToneMarks('wan2r')).to.equal('wan2r');
    });

    it('非法声调不猜', () => {
        expect(toToneMarks('ma6')).to.equal('ma6');
        expect(toToneMarks('ma33')).to.equal('ma33');
        expect(toToneMarks('ma3.5')).to.equal('ma3.5');
        expect(toToneMarks('ma-3')).to.equal('ma-3');
    });

    it('冒号指定了 ü 就不再看声母是否允许', () => {
        expect(toToneMarks('gu:1')).to.equal('gǖ');
        expect(toToneMarks('u:e1')).to.equal('üē');
        expect(toToneMarks('shv:3')).to.equal('shǚ');
    });

    it('冒号落不了点时才整串原样', () => {
        expect(toToneMarks('ma:1')).to.equal('ma:1');
        expect(toToneMarks('ha:o3')).to.equal('ha:o3');
        expect(toToneMarks('ji:1')).to.equal('ji:1');
        expect(toToneMarks('shui:3')).to.equal('shui:3');
    });

    it('大小写混排整串不动', () => {
        expect(toToneMarks('Hao3')).to.equal('Hao3');
        expect(toToneMarks('Ni3hao3')).to.equal('Ni3hao3');
        expect(toToneMarks('Zhong1Guo2')).to.equal('Zhong1Guo2');
        expect(toToneMarks('hAo3')).to.equal('hAo3');
    });

    it('汉字混排交给 toToneMarksInText，这里不动', () => {
        expect(toToneMarks('ni3我')).to.equal('ni3我');
        expect(toToneMarks('今天ni3hao3')).to.equal('今天ni3hao3');
    });
});

describe('分词：混排入口', () => {
    it('中文里夹一段连写拼音', () => {
        expect(toToneMarksInText('今天ni3hao3')).to.equal('今天nǐhǎo');
        expect(toToneMarksInText('我说ni3hao3')).to.equal('我说nǐhǎo');
    });

    it('标点分隔的两段都换', () => {
        expect(toToneMarksInText('ni3,hao3')).to.equal('nǐ,hǎo');
        expect(toToneMarksInText('ni3-hao3')).to.equal('nǐ-hǎo');
    });

    it('粘在英文单词旁边的片段不动', () => {
        expect(toToneMarksInText('abcju1')).to.equal('abcju1');
        expect(toToneMarksInText('ju1abc')).to.equal('ju1abc');
        expect(toToneMarksInText('abc_ju1')).to.equal('abc_ju1');
        expect(toToneMarksInText('3ju1')).to.equal('3ju1');
    });

    it('标点旁边照常换', () => {
        expect(toToneMarksInText('(ju1)')).to.equal('(jū)');
        expect(toToneMarksInText('ju1')).to.equal('jū');
    });

    it('已经是带调拼音的文本不再变化', () => {
        expect(toToneMarksInText('nǐ hǎo')).to.equal('nǐ hǎo');
        expect(toToneMarksInText('nǐ,hǎo')).to.equal('nǐ,hǎo');
    });
});

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
                const together = toToneMarks(a + b);
                const apart = toToneMarks(a + ' ' + b).replace(/ /g, '');
                if (together !== apart) bad.push(`${a + b}: ${together} !== ${apart}`);
            }
        }
        expect(bad).to.deep.equal([]);
    });

    it('三个音节连写也一样', () => {
        expect(toToneMarks('ni3hao3ma5')).to.equal(toToneMarks('ni3 hao3 ma5').replace(/ /g, ''));
        expect(toToneMarks('wo3ai4ni3')).to.equal(toToneMarks('wo3 ai4 ni3').replace(/ /g, ''));
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
            expect(letters(toToneMarks(s)), s).to.equal(letters(s));
        }
    });
});

describe('分词：冒号在连写与标点旁同样生效', () => {
    it('同一串里两种拼写并存', () => {
        expect(toToneMarks('ni3jv1')).to.equal('nǐjū');
        expect(toToneMarks('ni3ju:1')).to.equal('nǐjǖ');
    });

    it('标点两侧也保持一致', () => {
        expect(toToneMarks('ni3,jvan1')).to.equal('nǐ,juān');
        expect(toToneMarks('ni3,jvan:1')).to.equal('nǐ,jüān');
    });
});
