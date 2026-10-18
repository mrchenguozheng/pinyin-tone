// test/test-regex-anchoring.js
// 针对未锚定正则导致的「静默截断 / 大写错乱」问题的回归测试。
//
// 核心约定：单个音节整串匹配；一个 token 可以切成若干音节，
// 但任何一段认不出来就整串原样返回 —— 绝不输出半截结果。
import { expect } from 'chai';
import {markTones} from '../lib/index.js';

const tones = markTones;

// ---------------------------------------------------------------- 测试数据

// 没有声调数字做锚点，切不开：hanyu 中间没有任何分隔信息
const UNSPACED = [
    'hanyu3pin1yin1',
];

// 切得开但中间有不认识的片段（b / c 不是当前实现认识的音节），整串放弃
const UNSPACED_MIXED = [
    'a1b2c3',
    'a1b2c3d4',
];

// 不支持「音节+声调+r」，必须原样返回而不是把 r 吞掉
const LEGACY_ERHUA = [
    'hua1r',
    'wan2r',
    'ma1r',
    'hua0r',
    'hua1r5',
];

// 非法声调：旧实现会把 6 之后的数字直接丢掉
// `ma3.5` 不在这里：3 是合法声调，`.` 后的 5 是非拼音文本 —— 按片段各自处理，
// 现在输出 `mǎ.5`（见下面 conversions 里的说明）。
const INVALID_TONE = [
    'ma6',
    'ma7',
    'ma8',
    'ma9',
    'ma33',
    'ma-3',
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

// 标点旁边的符号类：不是拼音，也不该被吃掉
const SYMBOLS = [
    '/',
    '--',
    '...',
];

// 冒号落不了点：音节里根本没有 u/v 可承载两点（ma:1、ha:o3、ji:1），
// 以及词表那一格没把 v 当 ü（shui:3 -> shvi，输出会留着辅音 v）
const COLON_NO_LANDING = [
    'ma:1',
    'ha:o3',
    'ji:1',
    'shui:3',
];

// 冒号写在哪儿就是要哪儿的 ü，不看声母允不允许 —— 不规范音节照样输出
const COLON_ANY_INITIAL = [
    ['gu:1', 'gǖ'],
    ['shv:3', 'shǚ'],
    ['u:e1', 'üē'],
    ['ku:2', 'kǘ'],
];

// 连写：声调数字本身就是可靠的分隔符，现在能切开。
// 输出保持输入的分隔方式 —— 连写的音节之间不补空格。
const SEGMENTED = [
    ['ni3hao3', 'nǐhǎo'],
    ['hao3hao3', 'hǎohǎo'],
    ['ni3hao', 'nǐhao'],
    ['han4yu3pin1yin1', 'hànyǔpīnyīn'],
    ['ni3hao3ma5', 'nǐhǎoma'],
    ['ni3jue2', 'nǐjué'],
    ['xian4dai4hua4', 'xiàndàihuà'],
];

// 冒号后面还能接字母：lu:e4 是一个音节 lüe + 第四声，不是 lü + é
const COLON_MID_FINAL = [
    ['lu:e4', 'lüè'],
    ['nu:e4', 'nüè'],
    ['lu:e', 'lüe'],
    ['jue2 jve:2 lve4', 'jué jüé lüè'],
];

// 标点不再阻断转换，留在原位
const PUNCT_BOUND = [
    ['hao3!', 'hǎo!'],
    ['ni3,', 'nǐ,'],
    ['hao3.', 'hǎo.'],
    ['hao3?', 'hǎo?'],
    ['hao3;', 'hǎo;'],
    ['hao3:', 'hǎo:'],
    ['“hao3”', '“hǎo”'],
    ['(hao3)', '(hǎo)'],
    ['[hao3]', '[hǎo]'],
    ['hao3…', 'hǎo…'],
    ['hao3—', 'hǎo—'],
    ['ni3,hao3', 'nǐ,hǎo'],
    ['ni3/hao3', 'nǐ/hǎo'],
    ['na3-li3', 'nǎ-lǐ'],
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
    'bpmf',
    'r',
    'ü',
    'nǐ hǎo',     // 已经是带调拼音
];

// 空白：token 内部的空白现在也能跨过，音节之间不加空格（原有空白已经隔开）
const WHITESPACE = [
    ['ni3\nhao3', 'nǐ\nhǎo'],
    ['ni3\thao3', 'nǐ\thǎo'],
    ['ni3\thao3\two3', 'nǐ\thǎo\twǒ'],
];

const passThrough = [
    ...UNSPACED.map((s) => [s, 'unspaced']),
    ...UNSPACED_MIXED.map((s) => [s, 'unspaced mixed']),
    ...LEGACY_ERHUA.map((s) => [s, 'legacy erhua']),
    ...INVALID_TONE.map((s) => [s, 'invalid tone']),
    ...UPPERCASE.map((s) => [s, 'uppercase']),
    ...SYMBOLS.map((s) => [s, 'symbols']),
    ...COLON_NO_LANDING.map((s) => [s, 'colon has no landing']),
    ...NOT_PINYIN.map((s) => [s, 'not pinyin']),
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
    ['liou2 yuen2', 'lióu yuén'],                // 与 2.x（v1 实现）的既定差异
    // 首尾空白不再被裁掉：转换只改字母和声调，排版归调用方
    ['  ni3 hao3  ', '  nǐ hǎo  '],
    ['ni3 hao3 ', 'nǐ hǎo '],
    ['ni3  hao3', 'nǐ  hǎo'],
    ['', ''],
    // 片段各自处理：ma3 是完整音节，`.5` 是非拼音文本，只转前者
    ['ma3.5', 'mǎ.5'],
    // 连写、标点、空白
    ...SEGMENTED,
    ...COLON_MID_FINAL,
    ...COLON_ANY_INITIAL,
    ...PUNCT_BOUND,
    ...WHITESPACE,
];

// 混合句：合法的要转，不合法的要一动不动
// 标点紧贴拼音不再阻断转换，但标点本身原样保留（不再被吞掉）。
const mixedSentences = [
    ['ni3 hao3! wo3', 'nǐ hǎo! wǒ'],
    ['wo3 ai4 ni3!', 'wǒ ài nǐ!'],
    ['ni3hao3 wo3 hen3 hao3', 'nǐhǎo wǒ hěn hǎo'],
    ['Hao3 ma5?', 'Hao3 ma?'],
    ['zhong1 guo2 123 ren2', 'zhōng guó 123 rén'],
    ['han4 yu3, pin1 yin1.', 'hàn yǔ, pīn yīn.'],
    ['ni3 hao3 ! wo3', 'nǐ hǎo ! wǒ'],
    ['ni3hao3.hao3hao3', 'nǐhǎo.hǎohǎo'],
    ['ni3我', 'nǐ我'],
];

// 全表扫描用的声母 / 韵母
const SWEEP_INITIALS = ['', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
    'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
const SWEEP_FINALS = ['a', 'o', 'e', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong',
    'i', 'ia', 'ie', 'iao', 'iu', 'ian', 'in', 'iang', 'ing', 'iong',
    'u', 'ua', 'uo', 'uai', 'ui', 'uan', 'un', 'uang',
    'v', 've', 'van', 'vn', 'er'];
const SWEEP_TONES = ['', '0', '1', '2', '3', '4', '5'];

// ---------------------------------------------------------------- 工具

const TONE_MARKS = '\u0304\u0301\u030C\u0300';

/** 去掉声调符号、数字、标点、大小写、v/u 差异之后剩下的字母序列 */
function lettersOf(s) {
    return s
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^A-Za-z]/g, '')
        .toLowerCase()
        .replace(/v/g, 'u');
}

/**
 * 断言转换没有丢东西：输入里出现的每个字母，都必须按原顺序出现在输出里。
 * 两类差异忽略：声调数字会被消费掉（它已经变成符号），v 与 u 是 ü 的两种 ASCII 写法。
 *
 * 这一条同时排除了「半截转换」：ni3hao3 变成 nǐ 会让 hao 三个字母消失，
 * 而错误地多切一刀会让字母顺序对不上 —— 现在 lu:e4 -> lüè，
 * 冒号后的字母属于同一音节。
 */
function expectNoLoss(input, output, label) {
    expect(lettersOf(output), `${label}: 字母丢失或顺序变化`).to.equal(lettersOf(input));
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

// passThrough 里的 41 条按「为什么不能转」分成两类。两类的断言是同一句
// （输出 === 输入），但原因不同：这一组是「切了会丢字母」，下一组是「根本不是拼音」。
// 合在一起跑两遍只会让人以为有 82 个独立用例。
const TRUNCATION_KINDS = new Set(['unspaced', 'unspaced mixed', 'legacy erhua', 'invalid tone']);
const NOT_PINYIN_KINDS = new Set(['uppercase', 'symbols', 'colon has no landing', 'not pinyin']);

describe('regex anchoring: 切开会丢字母的输入，整串原样', () => {
    for (const [input, kind] of passThrough.filter(([, k]) => TRUNCATION_KINDS.has(k))) {
        it(`[${kind}] ${JSON.stringify(input)}`, () => {
            expect(tones(input)).to.equal(input);
        });
    }
});

describe('regex anchoring: 标点不再阻断转换', () => {
    // 旧行为是「吞掉标点后照样转换」（'hao3!' -> 'hǎo'），代价是信息丢失。
    // 更早一版改成了「有标点就整词不动」，代价是 'ni3,hao3' 这种整段失效。
    // 现在标点只当作音节边界，自己原样留在原位。
    it('尾随标点的 token 转换后标点原样保留', () => {
        expect(tones('hao3!')).to.equal('hǎo!');
        expect(tones('ni3, hao3')).to.equal('nǐ, hǎo');
        expect(tones('hao3. hao3')).to.equal('hǎo. hǎo');
    });

    it('标点单独成 token 时不受影响', () => {
        expect(tones('ni3 hao3 !')).to.equal('nǐ hǎo !');
    });
});

describe('regex anchoring: 合法拼音仍能正常转换', () => {
    for (const [input, expected] of conversions) {
        it(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
            expect(tones(input)).to.equal(expected);
        });
    }
});

describe('regex anchoring: 合法与非法 token 混在一句里', () => {
    for (const [input, expected] of mixedSentences) {
        it(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
            expect(tones(input)).to.equal(expected);
        });
    }
});

describe('regex anchoring: 根本不是拼音的输入，逐字不动', () => {
    for (const [input, kind] of passThrough.filter(([, k]) => NOT_PINYIN_KINDS.has(k))) {
        it(`[${kind}] ${JSON.stringify(input)}`, () => {
            expect(tones(input)).to.equal(input);
        });
    }

    // 上面两个 describe 靠 kind 标签筛选。新加一条数据却忘了归类时，
    // 它会在两个 describe 里都不出现；归错类则会两边都跑一遍。
    // 这条断言把这两种情况都挡住。
    it('两类标签互斥，且覆盖 passThrough 的每一条数据', () => {
        const both = passThrough.filter(
            ([, kind]) => TRUNCATION_KINDS.has(kind) && NOT_PINYIN_KINDS.has(kind),
        );
        expect(both).to.deep.equal([]);

        const covered = passThrough.filter(
            ([, kind]) => TRUNCATION_KINDS.has(kind) || NOT_PINYIN_KINDS.has(kind),
        );
        expect(covered).to.have.length(passThrough.length);
    });
});

describe('regex anchoring: 输出不变量', () => {
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
            expect(() => tones(s), `输入 ${JSON.stringify(s)}`).to.not.throw();
        }
    });

    it('幂等：tones(tones(x)) === tones(x)', () => {
        for (const s of allInputs) {
            const once = tones(s);
            expect(tones(once), `输入 ${JSON.stringify(s)}`).to.equal(once);
        }
    });

    it('不丢失字母：输出与输入的字母序列一致', () => {
        for (const s of allInputs) {
            expectNoLoss(s, tones(s), JSON.stringify(s));
        }
    });

    it('声调符号不会凭空多出来：数量不超过输入里的数字个数', () => {
        const bad = [];
        for (const s of allInputs) {
            const out = tones(s);
            // 原样返回的输入（已经带调、大小写混排）不参与这条统计
            if (out === s) continue;

            const digits = (s.match(/[0-9]/g) ?? []).length;
            const marks = toneMarkCount(out);
            if (marks > digits) {
                bad.push(`${JSON.stringify(s)} -> ${JSON.stringify(out)}（${marks} 调 / ${digits} 数字）`);
            }
        }
        expect(bad).to.deep.equal([]);
    });
});

describe('regex anchoring: 全音节表扫描', () => {
    it('轻声儿化：韵母 + r0 也要转换', () => {
        // 儿化在轻声下不加调号，但 r 必须留在输出里 —— 2.x 的旧实现曾把 ar0 原样返回。
        expect(tones('ar0')).to.equal('ar');
        expect(tones('bair0')).to.equal('bair');
        expect(tones('huar0')).to.equal('huar');
        expect(tones('vr0')).to.equal('ür');
    });

    it('全表范围内不出现 undefined / 空串 / 字母丢失', () => {
        for (const ini of SWEEP_INITIALS) {
            for (const fin of SWEEP_FINALS) {
                for (const t of SWEEP_TONES) {
                    const input = ini + fin + t;
                    const out = tones(input);
                    expect(typeof out, input).to.equal('string');
                    expectNoLoss(input, out, input);
                }
            }
        }
    });
});

describe('regex anchoring: 随机 fuzz', () => {
    const ALPHABET = (
        'abcdefghijklmnopqrstuvwxyz' +
        'ABHNZ' +
        '0123456789' +
        ' !?.,' +
        ':-/()' +
        '“”…中文😀Ωüé'
    ).split('');

    it('600 条随机字符串：不抛异常、幂等、字母不丢', () => {
        const rand = makeRandom(20261018);
        const failures = [];

        for (let n = 0; n < 600; n++) {
            const len = Math.floor(rand() * 12);
            let s = '';
            for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(rand() * ALPHABET.length)];

            try {
                const out = tones(s);
                expectNoLoss(s, out, `fuzz #${n} ${JSON.stringify(s)}`);

                // 幂等只对「第一遍输出仍是纯 ASCII」的输入成立。
                // 输出里一旦出现 ü 或调号，字符串就不在输入字母表里了：
                // 输入约定是 ASCII 拼音，`vv` -> `vü` 之后那个 v 会被再读一次
                // （v 单独就是一个音节，等于 ü），第二遍看到的是另一门语言。
                // ASCII 输出只可能来自「没写声调」或「轻声」，那时转换其实没改字母，
                // 幂等才是能立住的约束。
                if (!/[^\x00-\x7F]/.test(out) && tones(out) !== out) {
                    failures.push(`${JSON.stringify(s)}: 非幂等 -> ${JSON.stringify(out)}`);
                }
            } catch (err) {
                failures.push(`${JSON.stringify(s)}: ${err.message}`);
            }
        }

        expect(failures).to.deep.equal([]);
    });
});
