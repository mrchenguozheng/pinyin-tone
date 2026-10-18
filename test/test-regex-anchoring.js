// test/test-regex-anchoring.js
// 针对 v2 正则未锚定导致的「静默截断 / 大写错乱」问题的回归测试。
//
// 核心约定：整串匹配才算拼音；认不全就原样返回（与 v1 一致），绝不输出半截结果。
import { expect } from 'chai';
import toPinyinTonesV2 from '../v2/index.js';
import toPinyinTonesV1 from '../v1/index.js';

const v2 = toPinyinTonesV2;
const v1 = toPinyinTonesV1;

// ---------------------------------------------------------------- 测试数据

// 会被旧正则截断的输入：多音节连写、无分隔符
const UNSPACED = [
    'ni3hao3',
    'hao3hao3',
    'ni3hao',
    'hanyu3pin1yin1',
    'han4yu3pin1yin1',
    'ni3hao3ma5',
    'a1b2c3',
    'a1b2c3d4',
];

// v2 不支持「音节+声调+r」，必须原样返回而不是把 r 吞掉
const LEGACY_ERHUA = [
    'hua1r',
    'wan2r',
    'ma1r',
    'hua0r',
    'hua1r5',
];

// 非法声调：旧实现会把 6 之后的数字直接丢掉
const INVALID_TONE = [
    'ma6',
    'ma7',
    'ma8',
    'ma9',
    'ma33',
    'ma-3',
    'ma3.5',
];

// 大写：旧正则的 [a-z]+ 会跳过大写字母，从中间开始匹配
const UPPERCASE = [
    'Hao3',
    'Ni3 Hao3',
    'HAO3',
    'hAo3',
    'Hua1',
    'Zhong1Guo2',
    'Ni3hao3',
];

// 标点与符号：旧实现会把匹配段之后的字符全部丢弃
const PUNCTUATION = [
    'hao3!',
    'ni3,',
    'hao3.',
    'hao3?',
    'hao3;',
    'hao3:',
    '“hao3”',
    '(hao3)',
    '[hao3]',
    'hao3…',
    'hao3—',
    'lu:e4',
    '/',
    '--',
    '...',
    'ni3,hao3',
    'ni3/hao3',
    'na3-li3',
];

// 完全不是拼音的输入
const NOT_PINYIN = [
    '123',
    '1',
    '😀3',
    'Ω1',
    'ａ1',        // 全角字母
    '我3',        // 汉字混排
    '日本語',
    'ni3我',
    'bpmf',
    'r',
    'ü',
    'nǐ hǎo',     // 已经是带调拼音
];

// 空白：内部空白必须原样保留（v2 只 trim 首尾）
const WHITESPACE = [
    'ni3\nhao3',
    'ni3\thao3',
    'ni3\thao3\two3',
];

const passThrough = [
    ...UNSPACED.map((s) => [s, 'unspaced']),
    ...LEGACY_ERHUA.map((s) => [s, 'legacy erhua']),
    ...INVALID_TONE.map((s) => [s, 'invalid tone']),
    ...UPPERCASE.map((s) => [s, 'uppercase']),
    ...PUNCTUATION.map((s) => [s, 'punctuation']),
    ...NOT_PINYIN.map((s) => [s, 'not pinyin']),
    ...WHITESPACE.map((s) => [s, 'whitespace']),
];

// 合法输入必须保持正确转换（防止修正则时改坏）
const conversions = [
    // 基础
    ['ni3 hao3', 'nǐ hǎo'],
    ['chu1 yin1 wei4 lai2', 'chū yīn wèi lái'],
    ['xun2 yin1 liu2 ge1', 'xún yīn liú gē'],
    ['han4 yu3 pin1 yin1 fang1 an4', 'hàn yǔ pīn yīn fāng àn'],
    ['zhuang4 tai4', 'zhuàng tài'],
    ['wo3 ai4 ni3', 'wǒ ài nǐ'],
    ['zhe4 yang4', 'zhè yàng'],
    ['zhong1 guo2 ren2', 'zhōng guó rén'],
    // 声母 / 韵母单列
    ['b p m f', 'b p m f'],
    ['zh ch sh r', 'zh ch sh r'],
    ['an1 vn2 ong3 uen4', 'ān ǘn ǒng uèn'],
    ['iou1 uen4', 'iōu uèn'],
    ['v', 'ü'],
    ['ng', 'ng'],
    // 儿化
    ['huar1', 'huār'],
    ['renr2', 'rénr'],
    ['shuir3', 'shuǐr'],
    ['yuer4', 'yuèr'],
    ['banr2', 'bánr'],
    ['dianr1', 'diānr'],
    ['haor3', 'hǎor'],
    ['niaor3', 'niǎor'],
    ['zher4', 'zhèr'],
    ['huar', 'huar'],
    ['huar5', 'huar'],
    // ü
    ['nv3', 'nǚ'],
    ['lv2', 'lǘ'],
    ['lve4', 'lüè'],
    ['nve4', 'nüè'],
    ['jue2', 'jué'],
    ['xue3', 'xuě'],
    ['yun2', 'yún'],
    ['yuan2', 'yuán'],
    ['jun1', 'jūn'],
    ['qun2', 'qún'],
    ['xun4', 'xùn'],
    // 轻声 / 无声调
    ['ma', 'ma'],
    ['ma0', 'ma'],
    ['ma5', 'ma'],
    ['ma4', 'mà'],
    ['zi5', 'zi'],
    ['lo5', 'lo'],
    ['er', 'er'],
    ['er2', 'ér'],
    ['er4', 'èr'],
    // 四声
    ['ma1', 'mā'],
    ['ma2', 'má'],
    ['ma3', 'mǎ'],
    // 其他
    ['shui3', 'shuǐ'],
    ['dui4', 'duì'],
    ['gun3', 'gǔn'],
    ['shi2', 'shí'],
    ['ri4', 'rì'],
    ['ci2', 'cí'],
    ['si1', 'sī'],
    ['zhi1', 'zhī'],
    ['chi1', 'chī'],
    ['weng1', 'wēng'],
    ['yong3', 'yǒng'],
    ['xiong2', 'xióng'],
    ['jiong3', 'jiǒng'],
    ['yo1', 'yō'],
    ['bong1 tv2 pe3 wir4', 'bōng tǘ pě wìr'],   // 词表里的非标准组合
    ['liou2 yuen2', 'lióu yuén'],                // v2 与 v1 的既定差异
    // 首尾空白
    ['  ni3 hao3  ', 'nǐ hǎo'],
    ['ni3 hao3 ', 'nǐ hǎo'],
    ['ni3  hao3', 'nǐ  hǎo'],
    ['', ''],
];

// 混合句：合法的要转，不合法的要一动不动
// 注意：标点紧贴拼音时（"yu3,"）整词不转 —— 这是「整串匹配」策略的必然取舍，
// 调用方需要自己先按标点分词，或者期望值就应该是原样保留。
const mixedSentences = [
    ['ni3 hao3! wo3', 'nǐ hao3! wǒ'],
    ['wo3 ai4 ni3!', 'wǒ ài ni3!'],
    ['ni3hao3 wo3 hen3 hao3', 'ni3hao3 wǒ hěn hǎo'],
    ['Hao3 ma5?', 'Hao3 ma5?'],
    ['zhong1 guo2 123 ren2', 'zhōng guó 123 rén'],
    ['han4 yu3, pin1 yin1.', 'hàn yu3, pīn yin1.'],
    ['ni3 hao3 ! wo3', 'nǐ hǎo ! wǒ'],
];

// 全表扫描用的声母 / 韵母
const SWEEP_INITIALS = ['', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
    'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
const SWEEP_FINALS = ['a', 'o', 'e', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong',
    'i', 'ia', 'ie', 'iao', 'iu', 'ian', 'in', 'iang', 'ing', 'iong',
    'u', 'ua', 'uo', 'uai', 'ui', 'uan', 'un', 'uang',
    'v', 've', 'van', 'vn', 'er'];
const SWEEP_TONES = ['', '0', '1', '2', '3', '4', '5'];

// jvn / jvnr 是 j + ün，规范写法是 jun（省两点）→ jūn / jūnr。
// v1 对这一族保留两点（jǖn），与它自己处理 jv1（→ jū）的方式并不统一，
// 因此不能拿它当基准；v2 一律按国标输出。跳过的只是「对照」，不是「正确性」。
const isV1UmlautInconsistency = (input) => /^[jqxy]vn/.test(input);

// ---------------------------------------------------------------- 工具

const TOKEN_RE = /^[a-z]+[0-5]?$/;
const TONE_MARKS = '\u0304\u0301\u030C\u0300';

/** 断言输出没有「半截转换」：每个 token 要么原样，要么是完全匹配的拼音 */
function expectNoPartial(input, output, label) {
    const inTokens = input.trim().split(' ');
    const outTokens = output.split(' ');
    expect(outTokens.length, `${label}: token 数量变了（输入 ${inTokens.length} / 输出 ${outTokens.length}）`)
        .to.equal(inTokens.length);

    for (let i = 0; i < inTokens.length; i++) {
        const t = inTokens[i];
        const o = outTokens[i];
        if (o === t) continue;

        expect(t, `${label}: "${t}" 被改写成 "${o}"，但 "${t}" 不是完整拼音`).to.match(TOKEN_RE);
        expect(o, `${label}: "${t}" 转换后仍残留数字 -> "${o}"`).to.not.match(/[0-9]/);
        expect(o, `${label}: "${t}" 转换后为空`).to.not.equal('');
    }
}

/** 统计 token 中的声调符号数量 */
function toneMarkCount(token) {
    return [...token.normalize('NFD')].filter((c) => TONE_MARKS.includes(c)).length;
}

/** 固定种子的伪随机，保证 fuzz 可复现 */
function makeRandom(seed) {
    let s = seed >>> 0;
    return () => {
        s ^= s << 13; s >>>= 0;
        s ^= s >>> 17;
        s ^= s << 5; s >>>= 0;
        return s / 0x100000000;
    };
}

// ---------------------------------------------------------------- 用例

describe('v2 regex anchoring: 不完整的输入不得被截断', () => {
    for (const [input, kind] of passThrough) {
        it(`[${kind}] ${JSON.stringify(input)} 应原样返回`, () => {
            expect(v2(input)).to.equal(input);
        });
    }
});

describe('v2 regex anchoring: 已知取舍——标点紧贴拼音时不转换', () => {
    // 旧行为是「吞掉标点后照样转换」（'hao3!' -> 'hǎo'），代价是信息丢失。
    // 新行为选择保留原文，由调用方决定是否剥离标点。
    it('尾随标点的 token 原样保留', () => {
        expect(v2('hao3!')).to.equal('hao3!');
        expect(v2('ni3, hao3')).to.equal('ni3, hǎo');
        expect(v2('hao3. hao3')).to.equal('hao3. hǎo');
    });

    it('标点单独成 token 时不受影响', () => {
        expect(v2('ni3 hao3 !')).to.equal('nǐ hǎo !');
    });
});

describe('v2 regex anchoring: 合法拼音仍能正常转换', () => {
    for (const [input, expected] of conversions) {
        it(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
            expect(v2(input)).to.equal(expected);
        });
    }
});

describe('v2 regex anchoring: 合法与非法 token 混在一句里', () => {
    for (const [input, expected] of mixedSentences) {
        it(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
            expect(v2(input)).to.equal(expected);
        });
    }
});

describe('v2 regex anchoring: 非法输入的处理与 v1 对齐', () => {
    for (const [input, kind] of passThrough) {
        it(`[${kind}] v2(${JSON.stringify(input)}) === v1(...)`, () => {
            expect(v2(input)).to.equal(v1(input));
        });
    }
});

describe('v2 regex anchoring: 输出不变量', () => {
    const allInputs = [
        ...passThrough.map(([s]) => s),
        ...conversions.map(([s]) => s),
        ...mixedSentences.map(([s]) => s),
        'ni3hao3 hao3! Hao3 ma5...',
        '  ',
        '   ni3   hao3   ',
    ];

    it('任何输入都不会抛出异常', () => {
        for (const s of allInputs) {
            expect(() => v2(s), `输入 ${JSON.stringify(s)}`).to.not.throw();
        }
    });

    it('幂等：v2(v2(x)) === v2(x)', () => {
        for (const s of allInputs) {
            const once = v2(s);
            expect(v2(once), `输入 ${JSON.stringify(s)}`).to.equal(once);
        }
    });

    it('不产生半截转换', () => {
        for (const s of allInputs) {
            expectNoPartial(s, v2(s), JSON.stringify(s));
        }
    });

    it('转换后的 token 最多一个声调符号', () => {
        const bad = [];
        for (const s of allInputs) {
            for (const token of v2(s).split(' ')) {
                if (toneMarkCount(token) > 1) bad.push(`${JSON.stringify(s)} -> ${token}`);
            }
        }
        expect(bad).to.deep.equal([]);
    });
});

describe('v2 regex anchoring: 全音节表扫描', () => {
    it('除已知 ü 缺陷外，所有声母×韵母×声调组合与 v1 一致', () => {
        const diffs = [];
        for (const ini of SWEEP_INITIALS) {
            for (const fin of SWEEP_FINALS) {
                for (const t of SWEEP_TONES) {
                    const input = ini + fin + t;
                    if (isV1UmlautInconsistency(input)) continue;
                    const a = v1(input);
                    const b = v2(input);
                    if (a !== b) diffs.push(`${input}: v1=${a} v2=${b}`);
                }
            }
        }
        expect(diffs).to.deep.equal([]);
    });

    it('儿化全表：v1 能接受的组合与 v1 一致', () => {
        const diffs = [];
        for (const ini of SWEEP_INITIALS) {
            for (const fin of SWEEP_FINALS) {
                if (fin === 'er') continue;
                for (const t of SWEEP_TONES) {
                    const input = `${ini}${fin}r${t}`;
                    if (isV1UmlautInconsistency(input)) continue;
                    const a = v1(input);
                    // v1 对「纯韵母 + r0」有漏判（'ar0' 原样返回，'bair0' 却能转换），
                    // 这属于 v1 自身的历史怪癖，不能当作基准。
                    if (a === input) continue;
                    const b = v2(input);
                    if (a !== b) diffs.push(`${input}: v1=${a} v2=${b}`);
                }
            }
        }
        expect(diffs).to.deep.equal([]);
    });

    it('轻声儿化在 v2 中处理一致（v1 对纯韵母 + r0 有漏判）', () => {
        expect(v2('ar0')).to.equal('ar');
        expect(v2('bair0')).to.equal('bair');
        expect(v2('huar0')).to.equal('huar');
        expect(v2('vr0')).to.equal('ür');
    });

    it('全表范围内不出现 undefined / 空串 / 半截输出', () => {
        for (const ini of SWEEP_INITIALS) {
            for (const fin of SWEEP_FINALS) {
                for (const t of SWEEP_TONES) {
                    const input = ini + fin + t;
                    const out = v2(input);
                    expect(typeof out, input).to.equal('string');
                    expectNoPartial(input, out, input);
                }
            }
        }
    });
});

describe('v2 regex anchoring: 随机 fuzz', () => {
    const ALPHABET = (
        'abcdefghijklmnopqrstuvwxyz' +
        'ABHNZ' +
        '0123456789' +
        ' !?.,' +
        ':-/()' +
        '“”…中文😀Ωüé'
    ).split('');

    it('600 条随机字符串：不抛异常、幂等、无半截转换', () => {
        const rand = makeRandom(20261018);
        const failures = [];

        for (let n = 0; n < 600; n++) {
            const len = Math.floor(rand() * 12);
            let s = '';
            for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(rand() * ALPHABET.length)];

            try {
                const out = v2(s);
                expectNoPartial(s, out, `fuzz #${n} ${JSON.stringify(s)}`);
                if (v2(out) !== out) failures.push(`${JSON.stringify(s)}: 非幂等 -> ${JSON.stringify(out)}`);
            } catch (err) {
                failures.push(`${JSON.stringify(s)}: ${err.message}`);
            }
        }

        expect(failures).to.deep.equal([]);
    });
});
