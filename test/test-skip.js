// test/test-skip.js
// skip：按规则声明「哪些片段保持原样」，不必逐处写反斜杠。
//
// 为什么不是只有字符串列表：只比片段文本的话，同一个 token 的所有出现都被挡住，
// 规则一写宽就误伤。所以正则能匹配片段本身，函数还能看到 offset / before / after ——
// 后者是把规则收窄到「某一次出现」的出口。
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

    it('正则对片段文本做 test，g / y 不会让结果在两次之间翻转', () => {
        expect(markTones('M2 A4 N3 BEI3JING1', {skip: /^[A-Z]\d$/})).to.equal('M2 A4 N3 BĚIJĪNG');

        const re = /^M2$/g;
        expect(markTones('M2 M2 M2', {skip: re})).to.equal('M2 M2 M2');
        // 同一个正则对象第二次使用仍然一致（lastIndex 已在解析时剥掉）
        expect(markTones('M2 M2', {skip: re})).to.equal('M2 M2');
    });

    it('正则只看到片段自己，看不到前后字符', () => {
        // 片段是 "M2"，前后是空白与行首，正则里的 lookbehind 拿不到
        expect(markTones('今天 M2', {skip: /(?<=今天 )M2/})).to.equal('今天 Ḿ');
        // 片段内部的锚点照常生效：^ / $ 就是片段的两端
        expect(markTones('今天 M2', {skip: /^M2$/})).to.equal('今天 M2');
    });

    it('函数拿到 offset / before / after / text', () => {
        const seen = [];
        markTones('今天M2 hao3', {
            skip: (run, context) => {
                seen.push([run, context.offset, context.before, context.after, context.text]);
                return false;
            },
        });
        expect(seen).to.deep.equal([
            ['M2', 2, '天', ' ', '今天M2 hao3'],
            ['hao3', 5, ' ', '', '今天M2 hao3'],
        ]);
    });

    it('函数：按上下文收窄，而不是按 token 文本一刀切', () => {
        const onlyAtLineStart = (run, {before}) => before === '';
        expect(markTones('M2 hao3 M2', {skip: onlyAtLineStart})).to.equal('M2 hǎo Ḿ');
    });

    it('函数：用 offset 精确到某一次出现（误伤的反向修正）', () => {
        const text = 'M2 hao3 M2';
        const at = new Set([...text.matchAll(/M2/g)].map((match) => match.index));

        expect(markTones(text, {skip: (run, {offset}) => at.has(offset)})).to.equal('M2 hǎo M2');

        // 只保第二处：把第一处的下标从集合里去掉，它就照常转换
        at.delete(0);
        expect(markTones(text, {skip: (run, {offset}) => at.has(offset)})).to.equal('Ḿ hǎo M2');
    });

    it('只对本该转换的片段询问规则', () => {
        const asked = [];
        markTones('abcju1 ABC M2', {skip: (run) => (asked.push(run), false)});
        // abcju1 粘在英文里、ABC 没有声调数字 —— 两者本来就不转，不必问
        expect(asked).to.deep.equal(['M2']);
    });

    it('行内反斜杠优先于 skip，且反斜杠照旧消失', () => {
        expect(markTones('\\M2 hao3', {skip: 'M2'})).to.equal('M2 hǎo');
        expect(markTones('\\M2', {skip: /^M2$/})).to.equal('M2');
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
