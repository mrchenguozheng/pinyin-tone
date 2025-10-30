// test/test-example.js
import { expect } from 'chai'; // 导入 Chai 的 expect
import toPinyinTones, { splitUnspacedSyllables, convertUnspacedPinyin } from '../v2/index.js'; // 确保路径正确
import VersionOne from '../v1/index.js';

describe('toPinyinTones v2', () => {
    // const toPinyinTones = toPinyinTones
    it('example: should convert Chinese characters to pinyin with tones', () => {
        expect(toPinyinTones('chu1 yin1 wei4 lai2')).to.equal('chū yīn wèi lái');
        expect(toPinyinTones('xun2 yin1 liu2 ge1')).to.equal('xún yīn liú gē')
        expect(toPinyinTones('huar1 renr2 shuir3 yuer4')).to.equal('huār rénr shuǐr yuèr')
        expect(toPinyinTones('b p m f')).to.equal('b p m f')
        expect(toPinyinTones('an1 vn2 ong3 uen4')).to.equal('ān ǘn ǒng uèn')

        // the output is different from v1
        expect(toPinyinTones('liou2 yuen2')).to.equal('lióu yuén')

        expect(toPinyinTones('iou1 uen4')).to.equal('iōu uèn')
        expect(toPinyinTones('bong1 tv2 pe3 wir4')).to.equal('bōng tǘ pě wìr')
    });

    // 添加更多测试用例
    it('issue #8: should convert characters to pinyin with tones', () => {
        expect(toPinyinTones('makkai')).to.equal('makkai'); // 根据实际期望值进行调整
    });
});

describe('toPinyinTones v1', () => {
    const toPinyinTones = VersionOne
    it('example: should convert Chinese characters to pinyin with tones', () => {
        expect(toPinyinTones('chu1 yin1 wei4 lai2')).to.equal('chū yīn wèi lái');
        expect(toPinyinTones('xun2 yin1 liu2 ge1')).to.equal('xún yīn liú gē')
        expect(toPinyinTones('huar1 renr2 shuir3 yuer4')).to.equal('huār rénr shuǐr yuèr')
        expect(toPinyinTones('b p m f')).to.equal('b p m f')
        expect(toPinyinTones('an1 vn2 ong3 uen4')).to.equal('ān ǘn ǒng uèn')

        // the output is different from v2
        expect(toPinyinTones('liou2 yuen2')).to.equal('liú yún')

        expect(toPinyinTones('iou1 uen4')).to.equal('iōu uèn')
        expect(toPinyinTones('bong1 tv2 pe3 wir4')).to.equal('bōng tǘ pě wìr')
    });

    // 添加更多测试用例
    it('issue #8: should convert Chinese characters to pinyin with tones', () => {
        expect(toPinyinTones('makkai')).to.equal('makkai'); // 根据实际期望值进行调整
    });
});

describe('issue #16: allow pinyin without spaces', () => {
    it('should split unspaced syllables into spaced syllables', () => {
        // standard
        expect(splitUnspacedSyllables('han4yu3pin1yin1')).to.equal('han4 yu3 pin1 yin1')
        // multiple spaces
        expect(splitUnspacedSyllables('han4yu3  pin1yin1')).to.equal('han4 yu3 pin1 yin1')
        // mixed
        expect(splitUnspacedSyllables('han yu3  pin1yin1')).to.equal('han yu3 pin1 yin1')
        expect(splitUnspacedSyllables('han0  yu3  pin1yin1  ')).to.equal('han0 yu3 pin1 yin1')
    })

    it('should convert unspaced syllables string into toned pinyin string',()=>{
        // standard
        expect(convertUnspacedPinyin('han4yu3pin1yin1')).to.equal('hànyǔpīnyīn')
        // multiple spaces
        expect(convertUnspacedPinyin('han4 yu3  pin1   yin1')).to.equal('hànyǔpīnyīn')
        expect(convertUnspacedPinyin('han0yu3  pin1yin1')).to.equal('hanyǔpīnyīn')
        // er
        expect(convertUnspacedPinyin('han0   yur3  pin1yin1')).to.equal('hanyǔrpīnyīn')
        // mixed
        expect(convertUnspacedPinyin('han yu3pin1yin1')).to.equal('hanyǔpīnyīn')
        expect(convertUnspacedPinyin('hanyu3pin1yin1')).to.equal('hanyu3pīnyīn')
    })
})