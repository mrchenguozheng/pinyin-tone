// test/test-example.js
// README 示例对拍 —— 文档里出现的每一条输出，都必须能真的跑出来。
//
// 与 conversions 那张表的区别：那边测的是「行为对不对」，每加一条都是覆盖；
// 这边测的是「文档还准不准」，期望值逐条抄自 README 的注释与表格。
// 改实现时如果只有这里红，说明代码可能没错、是文档过期了。
import { expect } from 'chai';
import {markTones} from '../lib/index.js';

describe('README 示例', () => {
    it('Quick start', () => {
        expect(markTones('chu1 yin1 wei4 lai2')).to.equal('chū yīn wèi lái');
        expect(markTones('jv1 ju1 ju:1')).to.equal('jū jū jǖ');
        expect(markTones('今天ni3hao3')).to.equal('今天nǐhǎo');
    });

    it('How a run is read', () => {
        expect(markTones('ni3hao3')).to.equal('nǐhǎo');
        expect(markTones('ni3 hao3')).to.equal('nǐ hǎo');
        expect(markTones('ni3,hao3')).to.equal('nǐ,hǎo');
        expect(markTones('a1b2c3')).to.equal('a1b2c3');
        expect(markTones('hanyu3pin1yin1')).to.equal('hanyu3pin1yin1');
        expect(markTones('今天ni3hao3')).to.equal('今天nǐhǎo');
        // 正文里的三条断言：大写打断片段、0-5 外的数字不吞、下划线当词字符
        expect(markTones('Hao3')).to.equal('Hao3');
        expect(markTones('ma6')).to.equal('ma6');
        expect(markTones('ni3_hao3')).to.equal('ni3_hao3');
    });

    it('Spacing is yours', () => {
        expect(markTones('han4yu3pin1yin1')).to.equal('hànyǔpīnyīn');
        expect(markTones('han4 yu3  pin1   yin1')).to.equal('hàn yǔ  pīn   yīn');
        expect(markTones('han4 yu3pin1yin1').replace(/ /g, '')).to.equal('hànyǔpīnyīn');
        expect(markTones('han yu3pin1yin1')).to.equal('han yǔpīnyīn');
        expect(markTones('han0yu3pin1yin1')).to.equal('hanyǔpīnyīn');
        // 数字只有片段最后一段能省
        expect(markTones('ni3hao3ma')).to.equal('nǐhǎoma');
        expect(markTones('ni3haoma5')).to.equal('ni3haoma5');
        // 首尾空白不裁
        expect(markTones('  ni3 hao3  ')).to.equal('  nǐ hǎo  ');
    });

    it('Two spellings of ü', () => {
        expect(markTones('jv1')).to.equal('jū');
        expect(markTones('ju1')).to.equal('jū');
        expect(markTones('nv3')).to.equal('nǚ');
        expect(markTones('nu3')).to.equal('nǔ');
        expect(markTones('nu:3')).to.equal('nǚ');
    });

    it('The colon asks for the diaeresis', () => {
        expect(markTones('ju1 ju:1')).to.equal('jū jǖ');
        expect(markTones('juan:1')).to.equal('jüān');
        expect(markTones('lu:e4')).to.equal('lüè');
        expect(markTones('gu:1')).to.equal('gǖ');
        expect(markTones('u:e1')).to.equal('üē');
        // 两类落空
        expect(markTones('ma:1')).to.equal('ma:1');
        expect(markTones('ji:1')).to.equal('ji:1');
        expect(markTones('uang:1')).to.equal('uang:1');
        expect(markTones('shui:3')).to.equal('shui:3');
        // 冒号落在 v 上：视同裸写
        expect(markTones('jv:1')).to.equal('jǖ');
        expect(markTones('vv:1')).to.equal('vǖ');
    });

    it('ê 与没有元音的叹词', () => {
        expect(markTones('e^')).to.equal('ê');
        expect(markTones('e^2')).to.equal('ế');
        expect(markTones('e^4')).to.equal('ề');
        expect(markTones('be^2')).to.equal('be^2');
        expect(markTones('e^r')).to.equal('e^r');
        expect(markTones('e^:1')).to.equal('e^:1');
        expect(markTones('m2')).to.equal('ḿ');
        expect(markTones('ng4')).to.equal('ǹg');
        expect(markTones('hng1')).to.equal('hn̄g');
        expect(markTones('m3')).to.equal('m̌');
    });

    it('Strict mode', () => {
        expect(markTones('jui1')).to.equal('juī');
        expect(markTones('duang1')).to.equal('duāng');
        expect(markTones('jui1', { strict: true })).to.equal('jui1');
        expect(markTones('huar1', { strict: true })).to.equal('huār');
        expect(markTones('e^2', { strict: true })).to.equal('ế');
    });

    it('Mixed text', () => {
        expect(markTones('ju是规范写法，而ju:1是不规范写法'))
            .to.equal('ju是规范写法，而jǖ是不规范写法');
        expect(markTones('abcju1')).to.equal('abcju1');
        expect(markTones('ju1abc')).to.equal('ju1abc');
    });
});

describe('issue 回归', () => {
    // issue #8：英文单词不能被当成拼音切开。没有声调数字时切不动，
    // 有声调数字时也只在「整个 token 就是一个音节」的情况下才转换。
    it('issue #8：makkai 原样返回', () => {
        expect(markTones('makkai')).to.equal('makkai');
        expect(markTones('makkai1')).to.equal('makkai1');
    });

    // issue #16：支持无空格的连写输入。0 与 5 同样能当分隔符，
    // 儿化的 r 跟在数字后面仍属于上一个音节。
    it('issue #16：连写串不补空格地转换', () => {
        expect(markTones('han0yur3pin1yin1')).to.equal('hanyǔrpīnyīn');
    });
});
