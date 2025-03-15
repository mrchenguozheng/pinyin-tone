// test/test-example.js
const { expect } = require('chai'); // 导入 Chai 的 expect
const versionTwo = require('../v2'); // 确保路径正确
const VersionOne = require('../v1')

describe('toPinyinTones v2', () => {
    const toPinyinTones = versionTwo
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
    it('issue #8: should convert Chinese characters to pinyin with tones', () => {
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