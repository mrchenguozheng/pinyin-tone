// test/test-keys.js
// 词表的键必须能被输入语法命中 —— 否则它是一条打不中的死数据，白占字典。
//
// 这组断言来自一个真实存在过的 bug：'e^' 从 v2 第一版起就躺在 dict.js 里（值 'ê'），
// 而词法 [a-z]+ 永远匹配不到 ^，所以 e^2 一直原样返回。另一条是 'ü' 键，
// 值与 v 完全重复、同样打不中，已删除。
// 现在 ^ 成了 e 的可选后缀，两条死键都有了下文，这里把「键可达」钉成不变量。
import {assert} from 'chai';
import toToneMarks, { toToneMarksInText } from '../lib/index.js';
import dict from '../lib/dict.js';
import core from '../lib/core.js';

describe('e^：ê 的 ASCII 写法', () => {
    it('四个声调', () => {
        assert.equal(toToneMarks('e^1'), 'ê\u0304');
        assert.equal(toToneMarks('e^2'), 'ế');
        assert.equal(toToneMarks('e^3'), 'ê\u030c');
        assert.equal(toToneMarks('e^4'), 'ề');
    });

    it('轻声：不带数字、0、5 都是 ê', () => {
        assert.equal(toToneMarks('e^'), 'ê');
        assert.equal(toToneMarks('e^0'), 'ê');
        assert.equal(toToneMarks('e^5'), 'ê');
    });

    it('码位：ê̄ 与 ê̌ 是「字母 + 组合符」两个码位，ế 与 ề 是单个码位', () => {
        assert.deepEqual([...toToneMarks('e^1')].map((c) => c.codePointAt(0)), [0xEA, 0x304]);
        assert.deepEqual([...toToneMarks('e^3')].map((c) => c.codePointAt(0)), [0xEA, 0x30C]);
        assert.equal(toToneMarks('e^2').length, 1);
        assert.equal(toToneMarks('e^2').codePointAt(0), 0x1EBF);
        assert.equal(toToneMarks('e^4').length, 1);
        assert.equal(toToneMarks('e^4').codePointAt(0), 0x1EC1);
    });

    it('^ 只能戴在 e 上：不猜它该落到哪个字母', () => {
        for (const input of ['be^2', 'x^2', 'a^1', 'ma^3', 'e^r', 'e^x', 'e^^2']) {
            assert.equal(toToneMarks(input), input);
        }
    });

    it('与冒号互斥：ê 里没有 u 可标', () => {
        for (const input of ['e^:', 'e^:1']) {
            assert.equal(toToneMarks(input), input);
        }
    });

    it('连写与混排', () => {
        assert.equal(toToneMarks('e^2e^4'), 'ếề');
        assert.equal(toToneMarks('ni3e^2'), 'nǐế');
        assert.equal(toToneMarksInText('欸 e^2 欸'), '欸 ế 欸');
        assert.equal(toToneMarksInText('e^x 不动'), 'e^x 不动');
    });

    it('严格模式认它：ê 是普通话韵母', () => {
        assert.equal(toToneMarks('e^2', {strict: true}), 'ế');
        assert.equal(toToneMarks('e^', {strict: true}), 'ê');
    });

    it('幂等：输出里既没有数字也没有 ^，再转一次不变', () => {
        for (const tone of ['', '0', '1', '2', '3', '4', '5']) {
            const once = toToneMarks('e^' + tone);
            assert.equal(toToneMarks(once), once);
        }
    });
});

describe('词表的键必须打得中', () => {
    const keys = Object.keys(dict);

    it('每个键加声调 2 都能转换', () => {
        // 探针就是「键 + 2」：纯字母键得到 ni2 这种标准写法，e^ 得到 e^2，
        // 同一个拼接对两者都成立，不需要为谁特判。
        const dead = keys.filter((key) => toToneMarks(key + '2') === key + '2');
        assert.deepEqual(dead, []);
    });

    it('词表里没有语法拼不出的字符', () => {
        // 键只有两种形状：纯小写字母，或 e^。'ü' 那种既非 a-z、
        // 又没有任何输入能拼出来的键，一条都不许留。
        const strange = keys.filter((k) => !/^[a-z]+$/.test(k) && k !== 'e^');
        assert.deepEqual(strange, []);
    });

    it("'ü' 键已删除，v 仍然给 ü", () => {
        assert.isFalse('ü' in dict);
        assert.equal(toToneMarks('v'), 'ü');
        assert.equal(toToneMarks('v1'), 'ǖ');
        assert.equal(toToneMarks('nv3'), 'nǚ');
    });

    it('严格模式认的每个音节也都打得中', () => {
        const dead = [...core].filter((k) => toToneMarks(k + '2') === k + '2');
        assert.deepEqual(dead, []);
    });
});
