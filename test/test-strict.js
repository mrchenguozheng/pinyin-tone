// test/test-strict.js
// 严格模式：只认普通话的 425 个音节（+ 418 条儿化），其余整串原样。
// 默认模式不受影响 —— 词表还是那 1953 个键，一个都没删。
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
            ['m2', 'ḿ'], ['n2', 'ń'], ['ng2', 'ńg'], ['hm2', 'hḿ'], ['hng4', 'hǹg'],
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
        const passes = (key) => toPinyinTones(key + '1', {strict: true}) !== key + '1';

        // 词表 1953 个键，严格模式放行 875、挡掉 1078。
        // 放行的 875 = core 425 + 儿化 418 + jv 系列的字面拼写 32
        //   （jv/jve/jvan/jvn 及其儿化变体，j/q/x/y 各 8 条；它们与 ju/jue/juan/jun
        //    是同一音位，投影后照样是音节）。
        // 挡掉的 1078 = 1110 条笛卡尔积噪声减去那 32 条字面拼写。
        it('放行 875 个键，挡掉 1078 个', () => {
            const passed = keys.filter(passes);
            assert.equal(passed.length, 875);
            assert.equal(keys.length - passed.length, 1078);
        });

        it('非儿化 441，儿化 434', () => {
            const passed = keys.filter(passes);
            assert.equal(passed.filter((k) => !isErhua(k)).length, 441);
            assert.equal(passed.filter(isErhua).length, 434);
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
