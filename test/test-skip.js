// test/test-skip.js
// skip：按规则声明「哪些片段保持原样」，不必逐处写反斜杠。
//
// 只收字符串与字符串数组，比的是整个片段、区分大小写 —— 规则能打中的只有
// 「与声明一字不差」的片段。要精确到某一次出现就用行内的反斜杠：那是同一条
// 决定写在文本里，比在选项里补一套上下文判定直观，粒度也是同一个。
// 正则与函数都不收：这里能给的只有单个片段，正则的环视与文本级锚点会静默失效。
//
// 两条边界：
//   1. 只对**本来会转换**的片段询问规则（已经原样的没有东西可挡）。
//   2. 行内反斜杠优先于 skip，且 skip 开着时 `\M2` 里的反斜杠照旧消失。
import { expect } from 'chai';
import {markTones} from '../lib/index.js';

describe('skip：按规则保持原样', () => {
    it('字符串比的是整个片段，不是音节', () => {
        expect(markTones('M2 货币供应量 hao3', {skip: 'M2'})).to.equal('M2 货币供应量 hǎo');
        // 片段是 M2，不是 M
        expect(markTones('M2', {skip: 'M'})).to.equal('Ḿ');
        // 连写片段整体比较，拆开的音节名匹配不上
        expect(markTones('ni3hao3', {skip: 'ni3'})).to.equal('nǐhǎo');
        expect(markTones('ni3hao3', {skip: 'ni3hao3'})).to.equal('ni3hao3');
    });

    it('数组：一组一起挡，非字符串项忽略', () => {
        expect(markTones('M2 A4 N3 hao3', {skip: ['M2', 'A4']})).to.equal('M2 A4 Ň hǎo');
        expect(markTones('M2 A4', {skip: ['M2', 42, null]})).to.equal('M2 À');
        // 空数组等于没传
        expect(markTones('M2', {skip: []})).to.equal('Ḿ');
    });

    it('只收字符串与数组：函数、正则都不算数', () => {
        // 规则只比片段文本，没有「问一句再决定」这回事
        expect(markTones('M2', {skip: () => true})).to.equal('Ḿ');
        // 正则读起来是「在整段里找」，而这里只看得到单个片段，索性不收
        expect(markTones('M2', {skip: /^M2$/})).to.equal('Ḿ');
        expect(markTones('今天 M2', {skip: /(?<=今天 )M2/})).to.equal('今天 Ḿ');
    });

    it('只保一处：把决定写在反斜杠上，而不是在选项里补判定', () => {
        const text = 'M2 hao3 M2';
        // 规则是整类生效：两处都保住
        expect(markTones(text, {skip: 'M2'})).to.equal('M2 hǎo M2');
        // 只要第一处保住：不给规则，改在那一处前面写反斜杠，结果一样
        expect(markTones(text.replace('M2', '\\M2'))).to.equal('M2 hǎo Ḿ');
    });

    it('行内反斜杠优先于 skip，且反斜杠照旧消失', () => {
        expect(markTones('\\M2 hao3', {skip: 'M2'})).to.equal('M2 hǎo');
        expect(markTones('\\M2', {skip: ['M2', 'A4']})).to.equal('M2');
    });

    it('不认识的写法当没传（与 strict 一致：选项不该改变算法）', () => {
        for (const skip of [undefined, null, true, 42, {}, new Map(), () => true]) {
            expect(markTones('M2', {skip})).to.equal('Ḿ');
        }
    });

    it('skip 是大小写敏感的，也不动空白与边界判定', () => {
        expect(markTones('A4', {skip: 'a4'})).to.equal('À');
        expect(markTones('A4', {skip: 'A4'})).to.equal('A4');
        expect(markTones('  M2  ', {skip: 'M2'})).to.equal('  M2  ');
        expect(markTones('abcju1 M2', {skip: 'abcju1'})).to.equal('abcju1 Ḿ');
    });

    it('与 strict 同时生效', () => {
        expect(markTones('jui1 M2 hao3', {strict: true, skip: 'M2'})).to.equal('jui1 M2 hǎo');
    });
});
