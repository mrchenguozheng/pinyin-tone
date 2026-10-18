// test/test-skip.js
// skip：声明哪些片段保持原样。输入里不写任何标记字符 —— 要保住的东西全在选项里说，
// 这样含反斜杠、花括号的正文（路径、LaTeX、模板）一个字都不会被吃掉。
//
// 只收字符串与字符串数组，比的是整个片段、区分大小写。正则与函数都不收：这里能给的
// 只有单个片段，正则的环视与文本级锚点会静默失效；谓词则把声明式退回命令式，而它能
// 表达的东西（某一次出现、上下文）无一不需要调用方先知道文本的结构。
//
// 两条边界：
//   1. 只对**本来会转换**的片段询问规则（已经原样的没有东西可挡）。
//   2. 一次调用里同一个片段只能有一种处置 —— 要区别对待就切开文本分别调用。
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

    it('规则以片段为单位：一次调用里只能有一种处置', () => {
        // 同一句里两处 M2 都被保住，没有「只保其中一处」的写法
        expect(markTones('M2 hao3 M2', {skip: 'M2'})).to.equal('M2 hǎo M2');
        // 要区别对待就切开文本，分别调用
        expect(markTones('M2 hao3', {skip: 'M2'}) + markTones(' M2')).to.equal('M2 hǎo Ḿ');
    });

    it('反斜杠是普通字符：不吃掉，也不保护后面的片段', () => {
        expect(markTones('\\M2')).to.equal('\\Ḿ');
        expect(markTones('\\ni3')).to.equal('\\nǐ');
        // 路径与 LaTeX 一字不改（后面那段本来就粘在词字符上，不转）
        expect(markTones('C:\\Users')).to.equal('C:\\Users');
        expect(markTones('\\texttt{ni3}')).to.equal('\\texttt{nǐ}');
        expect(markTones('\\ni3_hao3')).to.equal('\\ni3_hao3');
    });

    it('不认识的写法当没传（与 strict 一致：选项不该改变算法）', () => {
        for (const skip of [undefined, null, true, 42, {}, new Map()]) {
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
