// test/test-example.js
// README 示例对拍 —— 文档里出现的每一条输出，都必须能真的跑出来。
//
// 与 conversions 那张表的区别：那边测的是「行为对不对」，每加一条都是覆盖；
// 这边测的是「文档还准不准」，期望值逐条抄自 README 的注释与表格。
// 改实现时如果只有这里红，说明代码可能没错、是文档过期了。
import { expect } from 'chai';
import toToneMarks, { toToneMarksInText } from '../lib/index.js';

describe('README 示例', () => {
    it('Quick start', () => {
        expect(toToneMarks('chu1 yin1 wei4 lai2')).to.equal('chū yīn wèi lái');
        expect(toToneMarks('jv1 ju1 ju:1')).to.equal('jū jū jǖ');
        expect(toToneMarksInText('今天ni3hao3')).to.equal('今天nǐhǎo');
    });

    it('How a token is read', () => {
        expect(toToneMarks('ni3hao3')).to.equal('nǐhǎo');
        expect(toToneMarks('ni3 hao3')).to.equal('nǐ hǎo');
        expect(toToneMarks('ni3,hao3')).to.equal('nǐ,hǎo');
        expect(toToneMarks('a1b2c3')).to.equal('a1b2c3');
        expect(toToneMarks('hanyu3pin1yin1')).to.equal('hanyu3pin1yin1');
    });

    it('Spacing is yours', () => {
        expect(toToneMarks('han4yu3pin1yin1')).to.equal('hànyǔpīnyīn');
        expect(toToneMarks('han4 yu3  pin1   yin1')).to.equal('hàn yǔ  pīn   yīn');
        expect(toToneMarks('han4 yu3pin1yin1').replace(/ /g, '')).to.equal('hànyǔpīnyīn');
        expect(toToneMarks('han yu3pin1yin1')).to.equal('han yǔpīnyīn');
        expect(toToneMarks('han0yu3pin1yin1')).to.equal('hanyǔpīnyīn');
    });

    it('Two spellings of ü', () => {
        expect(toToneMarks('jv1')).to.equal('jū');
        expect(toToneMarks('ju1')).to.equal('jū');
        expect(toToneMarks('nv3')).to.equal('nǚ');
        expect(toToneMarks('nu3')).to.equal('nǔ');
        expect(toToneMarks('nu:3')).to.equal('nǚ');
    });

    it('The colon asks for the diaeresis', () => {
        expect(toToneMarks('ju1 ju:1')).to.equal('jū jǖ');
        expect(toToneMarks('juan:1')).to.equal('jüān');
        expect(toToneMarks('lu:e4')).to.equal('lüè');
        expect(toToneMarks('gu:1')).to.equal('gǖ');
        expect(toToneMarks('u:e1')).to.equal('üē');
        // 两类落空
        expect(toToneMarks('ma:1')).to.equal('ma:1');
        expect(toToneMarks('ji:1')).to.equal('ji:1');
        expect(toToneMarks('uang:1')).to.equal('uang:1');
        expect(toToneMarks('shui:3')).to.equal('shui:3');
        // 冒号落在 v 上：视同裸写
        expect(toToneMarks('jv:1')).to.equal('jǖ');
        expect(toToneMarks('vv:1')).to.equal('vǖ');
    });

    it('ê 与没有元音的叹词', () => {
        expect(toToneMarks('e^')).to.equal('ê');
        expect(toToneMarks('e^2')).to.equal('ế');
        expect(toToneMarks('e^4')).to.equal('ề');
        expect(toToneMarks('be^2')).to.equal('be^2');
        expect(toToneMarks('e^r')).to.equal('e^r');
        expect(toToneMarks('e^:1')).to.equal('e^:1');
        expect(toToneMarks('m2')).to.equal('ḿ');
        expect(toToneMarks('ng4')).to.equal('ǹg');
        expect(toToneMarks('hng1')).to.equal('hn̄g');
        expect(toToneMarks('m3')).to.equal('m̌');
    });

    it('Strict mode', () => {
        expect(toToneMarks('jui1')).to.equal('juī');
        expect(toToneMarks('duang1')).to.equal('duāng');
        expect(toToneMarks('jui1', { strict: true })).to.equal('jui1');
        expect(toToneMarks('huar1', { strict: true })).to.equal('huār');
        expect(toToneMarks('e^2', { strict: true })).to.equal('ế');
    });

    it('Mixed text', () => {
        expect(toToneMarksInText('ju是规范写法，而ju:1是不规范写法'))
            .to.equal('ju是规范写法，而jǖ是不规范写法');
        expect(toToneMarksInText('abcju1')).to.equal('abcju1');
        expect(toToneMarksInText('ju1abc')).to.equal('ju1abc');
    });
});

describe('issue 回归', () => {
    // issue #8：英文单词不能被当成拼音切开。没有声调数字时切不动，
    // 有声调数字时也只在「整个 token 就是一个音节」的情况下才转换。
    it('issue #8：makkai 原样返回', () => {
        expect(toToneMarks('makkai')).to.equal('makkai');
        expect(toToneMarks('makkai1')).to.equal('makkai1');
    });

    // issue #16：支持无空格的连写输入。0 与 5 同样能当分隔符，
    // 儿化的 r 跟在数字后面仍属于上一个音节。
    it('issue #16：连写串不补空格地转换', () => {
        expect(toToneMarks('han0yur3pin1yin1')).to.equal('hanyǔrpīnyīn');
    });
});
