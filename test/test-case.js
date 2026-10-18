// test/test-case.js
// 大小写的三种合法形态：全小写、首字母大写、全大写。
//
// 依据《汉语拼音正词法基本规则》(GB/T 16159—2012) §6.3：大写出现在句首、
// 诗歌行首、专名首字母，以及「某些场合专名可以全部大写」（BĚIJĪNG、LǏ HUÁ）。
// §6.5 的标调规则没有为大写开口子 —— 标准自己的全大写示例仍带调号。
// 音节内部混用（hAo3）不是标准里的写法，整串原样返回。
//
// 形态按音节判定，所以一个 token 里可以既有全大写音节又有全小写音节
// （ZHONG1guo2 -> ZHŌNGguó）—— 那正是「专名首字母大写、其余小写」的写法。
import { expect } from 'chai';
import {markTones} from '../lib/index.js';

describe('大小写：调号落在大写元音上', () => {
    it('ü 系：Unicode 有预组合的大写带调字形', () => {
        expect(markTones('NV3')).to.equal('N\u01D9');        // NǙ
        expect(markTones('LV4')).to.equal('L\u01DB');        // LǛ
        expect(markTones('NV2')).to.equal('N\u01D7');        // NǗ
        expect([...markTones('NV3')]).to.have.length(2);     // 不是 N + 组合符
    });

    it('ê：二声四声有预组合，一声三声只能拼', () => {
        expect(markTones('E^')).to.equal('\u00CA');            // Ê
        expect(markTones('E^2')).to.equal('\u1EBE');           // Ế
        expect(markTones('E^4')).to.equal('\u1EC0');           // Ề
        expect(markTones('E^1')).to.equal('\u00CA\u0304');     // Ê + 组合符
    });

    it('没有元音的叹词音节：调号落在鼻音上', () => {
        expect(markTones('M2')).to.equal('\u1E3E');            // Ḿ
        expect(markTones('NG3')).to.equal('\u0147G');         // ŇG
        expect(markTones('HNG1')).to.equal('HN\u0304G');       // HN̄G
    });

    it('冒号与 ^ 与大小写正交', () => {
        expect(markTones('JU:1')).to.equal('J\u01D5');         // JǕ
        expect(markTones('JVAN:1')).to.equal('J\u00DC\u0100N'); // JÜĀN
        expect(markTones('Jv:1')).to.equal('J\u01D6');         // Jǖ（只有首字母大写）
        expect(markTones('V:1')).to.equal('\u01D5');           // Ǖ
    });
});

describe('大小写：形态按音节判定', () => {
    it('专名写法：首音节大写，其余小写', () => {
        expect(markTones('Zhong1guo2')).to.equal('Zhōngguó');
        expect(markTones('Bei3jing1')).to.equal('Běijīng');
    });

    it('一个 token 里两种形态并存也各按自己那一格投影', () => {
        expect(markTones('ZHONG1guo2')).to.equal('ZHŌNGguó');
        expect(markTones('Ni3hao3')).to.equal('Nǐhǎo');
        expect(markTones('NI3hao3')).to.equal('NǏhǎo');
    });

    it('连写时大写不再把前后两段一起挡住', () => {
        expect(markTones('ni3Hao3')).to.equal('nǐHǎo');
        expect(markTones('ni3Hao3ma5')).to.equal('nǐHǎoma');
    });
});

describe('大小写：不属于三种形态的输入整串原样', () => {
    it('音节内部混用', () => {
        for (const s of ['hAo3', 'HaO3', 'aNd3', 'nI3hao3']) {
            expect(markTones(s), s).to.equal(s);
        }
    });

    it('混用不会只坏一段：整串放弃，不输出半截', () => {
        expect(markTones('ni3hAo3')).to.equal('ni3hAo3');
    });

    it('粘在英文单词上的大写片段仍不动', () => {
        expect(markTones('ABCJU1')).to.equal('ABCJU1');
        expect(markTones('JU1ABC')).to.equal('JU1ABC');
        expect(markTones('3JU1')).to.equal('3JU1');
        expect(markTones('ni3_HAO3')).to.equal('ni3_HAO3');
    });
});

describe('大小写：与 strict 及重复调用', () => {
    it('strict 只看音节，不看形态', () => {
        expect(markTones('HUA1', {strict: true})).to.equal('HUĀ');
        expect(markTones('JUI1', {strict: true})).to.equal('JUI1');
    });

    it('已带调号的大写文本再跑一次不变', () => {
        for (const s of ['BĚIJĪNG', 'NǙ', 'Ế', 'HN̄G', 'ZHŌNGguó']) {
            expect(markTones(s), s).to.equal(s);
        }
    });
});
