// test/test-strict.js
// 严格模式：只认普通话的 426 个音节（+ 418 条儿化），其余整串原样。
// 默认模式不受影响 —— 词表还是那 1952 个键，一个都没挡。
import {assert} from 'chai';
import toPinyinTones, {
    convertUnspacedPinyin,
    toPinyinTonesInline,
    toPinyinTonesVariants,
} from '../v2/index.js';
import dict from '../v2/dict.js';
import core from '../v2/core.js';

/** 儿化键：去掉尾字母 r 就是基底。er 本身是音节，不算儿化。 */
const isErhua = (key) => key !== 'er' && key.length > 1 && key.endsWith('r');

describe('v2 严格模式', () => {
    describe('默认模式什么都不变', () => {
        // 这些在普通话里都不是音节，默认模式照转不误 —— 这是既有的宽容行为
        const EXTENDED = ['jui1', 'juang1', 'juei2', 'jua4', 'biong2', 'duang1', 'biu1', 'vai1'];
        const EXPECTED = ['juī', 'juāng', 'juéi', 'juà', 'bióng', 'duāng', 'biū', 'vāi'];

        EXTENDED.forEach((input, i) => {
            it(`${input} -> ${EXPECTED[i]}`, () => {
                assert.equal(toPinyinTones(input), EXPECTED[i]);
            });
        });
    });

    describe('严格模式只认普通话音节', () => {
        const CORE = [
            ['ma1', 'mā'], ['ni3', 'nǐ'], ['hao3', 'hǎo'], ['xiong2', 'xióng'],
            ['zhuang1', 'zhuāng'], ['lv4', 'lǜ'], ['er2', 'ér'], ['e1', 'ē'],
            ['dia3', 'diǎ'], ['rua2', 'ruá'], ['nun2', 'nún'], ['zhei4', 'zhèi'],
            ['m2', 'ḿ'], ['n2', 'ń'], ['ng2', 'ńg'],
        ];

        CORE.forEach(([input, expected]) => {
            it(`${input} -> ${expected}`, () => {
                assert.equal(toPinyinTones(input, {strict: true}), expected);
            });
        });

        // 笛卡尔积噪声 + 网络/口语音 + v 作辅音，严格模式一律不认
        const EXTENDED = ['jui1', 'juang1', 'juei2', 'jua4', 'biong2', 'duang1', 'biu1', 'vai1',
            'bvan1', 'shvi1', 'gv1', 'juangr1'];

        EXTENDED.forEach((input) => {
            it(`${input} 原样返回`, () => {
                assert.equal(toPinyinTones(input, {strict: true}), input);
            });
        });
    });

    describe('叹词音节：词典收录的照抄，其余按规则外推', () => {
        // 这 9 个是词典里真实出现的字形，逐条抄自 pypinyin 的 pinyin_dict
        // （m̄ 嘸、ḿ 呒呣唔嘸、m̀ 呣；ń 咹哽唔嗯、ň 㕶嗯、ǹ 哏嗯；ńg、ňg、ǹg 嗯）
        const LISTED = [
            ['m1', 'm\u0304'], ['m2', 'ḿ'], ['m4', 'm\u0300'],
            ['n2', 'ń'], ['n3', 'ň'], ['n4', 'ǹ'],
            ['ng2', 'ńg'], ['ng3', 'ňg'], ['ng4', 'ǹg'],
        ];

        LISTED.forEach(([input, expected]) => {
            it(`${input} -> ${expected}`, () => {
                assert.equal(toPinyinTones(input), expected);
            });
        });

        // 词典没收录的格子不拒绝，按「标在最后一个鼻音上」补齐：
        // m 没有第三声，n 与 ng 没有第一声，hm（噷）与 hng（哼）只有无调。
        // 这 11 个是外推形式 —— 字形由规则算，词典里没有。
        const DERIVED = [
            ['m3', 'm\u030c'],
            ['n1', 'n\u0304'],
            ['ng1', 'n\u0304g'],
            ['hm1', 'hm\u0304'], ['hm2', 'hḿ'], ['hm3', 'hm\u030c'], ['hm4', 'hm\u0300'],
            ['hng1', 'hn\u0304g'], ['hng2', 'hńg'], ['hng3', 'hňg'], ['hng4', 'hǹg'],
        ];

        DERIVED.forEach(([input, expected]) => {
            it(`${input} -> ${expected}`, () => {
                assert.equal(toPinyinTones(input), expected);
            });
        });

        it('外推形式与词典字形不冲突', () => {
            // 有依据的 9 个必须逐条与闭集表一致，不能被规则覆写
            LISTED.forEach(([input, expected]) => {
                assert.equal(toPinyinTones(input), expected);
            });
            // hm 与 hng 的调号落在最后一个鼻音上
            assert.equal(toPinyinTones('hm2'), 'hḿ');
            assert.equal(toPinyinTones('hng2'), 'hńg');
            assert.equal(toPinyinTones('ng1'), 'n\u0304g');
        });

        it('轻声不受影响：无调形式就是音节本身', () => {
            ['m', 'n', 'ng', 'hm', 'hng'].forEach((key) => {
                assert.equal(toPinyinTones(key), key);
                assert.equal(toPinyinTones(key + '5'), key);
                assert.equal(toPinyinTones(key + '0'), key);
            });
        });

        it('m̄ 与 m̀ 是「字母 + 组合符」两个码位', () => {
            // 这两个没有预组合字符，必须靠 U+0304 / U+0300 叠上去
            assert.deepEqual([...toPinyinTones('m1')].map((c) => c.codePointAt(0)), [0x6D, 0x304]);
            assert.deepEqual([...toPinyinTones('m4')].map((c) => c.codePointAt(0)), [0x6D, 0x300]);
            // ḿ / ń 有预组合字符，是单个码位
            assert.equal(toPinyinTones('m2').length, 1);
            assert.equal(toPinyinTones('n2').length, 1);
            // m̌ 同样没有预组合字符
            assert.deepEqual([...toPinyinTones('m3')].map((c) => c.codePointAt(0)), [0x6D, 0x30C]);
        });
    });

    describe('儿化由基底决定', () => {
        it('基底是音节就通过', () => {
            assert.equal(toPinyinTones('huar1', {strict: true}), 'huār');
            assert.equal(toPinyinTones('nar3', {strict: true}), 'nǎr');
            assert.equal(toPinyinTones('dianr3', {strict: true}), 'diǎnr');
        });

        it('基底不是音节就落空', () => {
            assert.equal(toPinyinTones('juir1', {strict: true}), 'juir1');
            assert.equal(toPinyinTones('buair1', {strict: true}), 'buair1');
        });

        it('er 是音节，不按「e + r」拆', () => {
            assert.equal(toPinyinTones('er2', {strict: true}), 'ér');
            assert.equal(toPinyinTones('er0', {strict: true}), 'er');
        });
    });

    describe('字面拼写不绕过白名单', () => {
        // jv / jve / jvan / jvn 与 ju 同一音位，投影后照样要过 core
        it('jv1 与 ju1 同样通过', () => {
            assert.equal(toPinyinTones('jv1', {strict: true}), 'jū');
            assert.equal(toPinyinTones('jve2', {strict: true}), 'jué');
        });

        it('投影后仍不是音节的落空', () => {
            assert.equal(toPinyinTones('jvi1', {strict: true}), 'jvi1');
            assert.equal(toPinyinTones('jvangr1', {strict: true}), 'jvangr1');
        });

        it('冒号要的 ü 也要落在音节上', () => {
            assert.equal(toPinyinTones('ju:1', {strict: true}), 'jǖ');
            // g 不接 ü，gǖ 不是音节 —— 默认模式照给，严格模式拒绝
            assert.equal(toPinyinTones('gu:1', {strict: true}), 'gu:1');
            assert.equal(toPinyinTones('gu:1'), 'gǖ');
        });
    });

    describe('全表计数', () => {
        const keys = Object.keys(dict);
        // 四个声调里任何一个能出字，就算这个键在严格模式下立得住。
        // 不能只看第一声 —— 词典里 n 与 ng 没有第一声（那格由规则外推）。
        const passes = (key) => [1, 2, 3, 4].some(
            (tone) => toPinyinTones(key + tone, {strict: true}) !== key + tone,
        );

        // 词表 1952 个键，严格模式放行 876、挡掉 1076。
        // 放行的 876 = core 426 + 儿化 418 + jv 系列的字面拼写 32。
        //   jv/jve/jvan/jvn 及其儿化变体与 ju/jue/juan/jun 是同一音位，投影后照样是音节。
        // 挡掉的 1076 = 1110 条笛卡尔积噪声减去那 32 条字面拼写，再减去 e^
        //   （它先前是死键，进了 core 才在严格模式下立得住）。
        it('放行 876 个键，挡掉 1076 个', () => {
            const passed = keys.filter(passes);
            assert.equal(passed.length, 876);
            assert.equal(keys.length - passed.length, 1076);
        });

        it('非儿化 442，儿化 434', () => {
            const passed = keys.filter(passes);
            assert.equal(passed.filter((k) => !isErhua(k)).length, 442);
            assert.equal(passed.filter(isErhua).length, 434);
        });

        it('core 里的每个键都能出带调形式', () => {
            const toneless = [...core].filter((k) => !passes(k));
            assert.deepEqual(toneless.sort(), []);
        });

        it('core 之外的放行只有 jv 系列的字面拼写', () => {
            const LITERAL = ['jv', 'jve', 'jvan', 'jvn', 'qv', 'qve', 'qvan', 'qvn',
                'xv', 'xve', 'xvan', 'xvn', 'yv', 'yve', 'yvan', 'yvn'];
            const outside = keys
                .filter(passes)
                .filter((k) => !core.has(isErhua(k) ? k.slice(0, -1) : k));

            assert.deepEqual(outside.sort(), [...LITERAL, ...LITERAL.map((k) => k + 'r')].sort());
        });

        it('core 里的每个键都在词表里', () => {
            const missing = [...core].filter((k) => dict[k] === undefined);
            assert.deepEqual(missing, []);
        });
    });

    describe('选项只在 strict 上生效', () => {
        it('空对象 / undefined / null 都是默认模式', () => {
            assert.equal(toPinyinTones('jui1', {}), 'juī');
            assert.equal(toPinyinTones('jui1', undefined), 'juī');
            assert.equal(toPinyinTones('jui1', null), 'juī');
        });

        it('真值才算严格模式', () => {
            assert.equal(toPinyinTones('jui1', {strict: 1}), 'jui1');
            assert.equal(toPinyinTones('jui1', {strict: 'no'}), 'jui1');
            assert.equal(toPinyinTones('jui1', {strict: false}), 'juī');
        });

        it('未知字段被忽略', () => {
            assert.equal(toPinyinTones('jui1', {literal: true}), 'juī');
        });
    });

    describe('其他入口同样生效', () => {
        it('toPinyinTonesInline', () => {
            assert.equal(
                toPinyinTonesInline('你好 ni3hao3 和 jui1', {strict: true}),
                '你好 nǐhǎo 和 jui1',
            );
            assert.equal(
                toPinyinTonesInline('你好 ni3hao3 和 jui1'),
                '你好 nǐhǎo 和 juī',
            );
        });

        it('toPinyinTonesVariants 两边一起收', () => {
            assert.deepEqual(
                toPinyinTonesVariants('jui1', {strict: true}),
                {canonical: 'jui1', literal: 'jui1'},
            );
            assert.deepEqual(
                toPinyinTonesVariants('ju:1', {strict: true}),
                {canonical: 'jǖ', literal: 'jǖ'},
            );
        });

        it('convertUnspacedPinyin', () => {
            assert.equal(convertUnspacedPinyin('ni3hao3', {strict: true}), 'nǐhǎo');
            // 先按声调数字切成两个音节再各自转换，所以 jui1 落空只影响它自己
            assert.equal(convertUnspacedPinyin('ni3jui1', {strict: true}), 'nǐjui1');
            assert.equal(convertUnspacedPinyin('ni3jui1'), 'nǐjuī');
        });
    });
});
