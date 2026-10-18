// test/test-example.js
import { expect } from 'chai'; // 导入 Chai 的 expect
import toPinyinTones from '../lib/index.js';

describe('toPinyinTones', () => {
    // const toPinyinTones = toPinyinTones
    it('example: should convert Chinese characters to pinyin with tones', () => {
        expect(toPinyinTones('chu1 yin1 wei4 lai2')).to.equal('chū yīn wèi lái');
        expect(toPinyinTones('xun2 yin1 liu2 ge1')).to.equal('xún yīn liú gē')
        expect(toPinyinTones('huar1 renr2 shuir3 yuer4')).to.equal('huār rénr shuǐr yuèr')
        expect(toPinyinTones('b p m f')).to.equal('b p m f')
        expect(toPinyinTones('an1 vn2 ong3 uen4')).to.equal('ān ǘn ǒng uèn')

        expect(toPinyinTones('liou2 yuen2')).to.equal('lióu yuén')

        expect(toPinyinTones('iou1 uen4')).to.equal('iōu uèn')
        expect(toPinyinTones('bong1 tv2 pe3 wir4')).to.equal('bōng tǘ pě wìr')
    });

    // 添加更多测试用例
    it('issue #8: should convert characters to pinyin with tones', () => {
        expect(toPinyinTones('makkai')).to.equal('makkai'); // 根据实际期望值进行调整
    });
});

describe('issue #16: allow pinyin without spaces', () => {
    it('连写串照样转换，且不补空格', () => {
        expect(toPinyinTones('han4yu3pin1yin1')).to.equal('hànyǔpīnyīn')
        expect(toPinyinTones('han0yur3pin1yin1')).to.equal('hanyǔrpīnyīn')
        expect(toPinyinTones('ni3hao3')).to.equal('nǐhǎo')
    });

    it('输入里写了空格就留着，多了也不删', () => {
        expect(toPinyinTones('han4 yu3  pin1   yin1')).to.equal('hàn yǔ  pīn   yīn')
        expect(toPinyinTones('han yu3pin1yin1')).to.equal('han yǔpīnyīn')
    });

    it('没有声调数字可切的地方不猜，整串原样', () => {
        expect(toPinyinTones('hanyu3pin1yin1')).to.equal('hanyu3pin1yin1')
    });
});
