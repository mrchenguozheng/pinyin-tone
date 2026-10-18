// test/test-example.js
// README 的 Usage 示例对拍 —— 文档里写的每一条输出，都必须能真的跑出来。
//
// 与 conversions 那张表的区别：那边测的是「行为对不对」，每加一条都是覆盖；
// 这边测的是「文档还准不准」，期望值逐条抄自 README「Usage」一节的注释。
// 改实现时如果只有这里红，说明代码可能没错、是文档过期了。
import { expect } from 'chai';
import toPinyinTones from '../lib/index.js';

describe('README Usage 示例', () => {
    it('基础句子', () => {
        expect(toPinyinTones('chu1 yin1 wei4 lai2')).to.equal('chū yīn wèi lái');
        expect(toPinyinTones('xun2 yin1 liu2 ge1')).to.equal('xún yīn liú gē');
        expect(toPinyinTones('han4 yu3 pin1 yin1 fang1 an4')).to.equal('hàn yǔ pīn yīn fāng àn');
    });

    it('儿化', () => {
        expect(toPinyinTones('huar1 renr2 shuir3 yuer4')).to.equal('huār rénr shuǐr yuèr');
    });

    it('声母与韵母单列', () => {
        expect(toPinyinTones('b p m f')).to.equal('b p m f');
        expect(toPinyinTones('an1 vn2 ong3 uen4')).to.equal('ān ǘn ǒng uèn');
    });

    it('特殊组合', () => {
        expect(toPinyinTones('liou2 yuen2')).to.equal('lióu yuén');
        expect(toPinyinTones('iou1 uen4')).to.equal('iōu uèn');
        expect(toPinyinTones('bong1 tv2 pe3 wir4')).to.equal('bōng tǘ pě wìr');
    });
});

describe('issue 回归', () => {
    // issue #8：英文单词不能被当成拼音切开。没有声调数字时切不动，
    // 有声调数字时也只在「整个 token 就是一个音节」的情况下才转换。
    it('issue #8：makkai 原样返回', () => {
        expect(toPinyinTones('makkai')).to.equal('makkai');
        expect(toPinyinTones('makkai1')).to.equal('makkai1');
    });

    // issue #16：支持无空格的连写输入。0 与 5 同样能当分隔符，
    // 儿化的 r 跟在数字后面仍属于上一个音节。
    it('issue #16：连写串不补空格地转换', () => {
        expect(toPinyinTones('han0yur3pin1yin1')).to.equal('hanyǔrpīnyīn');
    });
});
