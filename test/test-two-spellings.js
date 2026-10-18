// test/test-two-spellings.js
// j/q/x/y + ü 的两种拼写（规范 ju / 字面 jv）在输出层的区分测试。
//
// 核心约定：
//   只有一种默认输出 —— 国标规范形式，j/q/x/y 后的 ü 省两点（jv1 -> jū）。
//   字面形式不做成全局选项，只在写了冒号的那一处出现（ju:1 -> jǖ）。
//   冒号写在 u 上（u 就是要带两点的字母）；jv: 是同义写法，不算错误。
//   于是「同一行里并排两种写法」不需要任何额外开关。
//
// 方法：实现层用「换查表键」做投影，测试层用「字符级替换」独立算出期望值。
// 两条路径不同，交叉验证才有效。
import { expect } from 'chai';
import toPinyinTones, { convertUnspacedPinyin, toPinyinTonesVariants } from '../lib/index.js';
import dict from '../lib/dict.js';
import { expectedValue } from './support/dict-values.js';

// ---------------------------------------------------------------- 闭集白名单

const HEADS = ['j', 'q', 'x', 'y'];
const FINALS = ['v', 've', 'van', 'vn', 'vr', 'ver', 'vanr', 'vnr'];

// 字面写法：jv jve jvan jvn + 儿化，共 32 个
const LITERAL_KEYS = HEADS.flatMap((h) => FINALS.map((f) => h + f));
// 对应的规范写法：ju jue juan jun + 儿化
const CANONICAL_KEYS = LITERAL_KEYS.map((k) => k.replace('v', 'u'));

const TONES = [0, 1, 2, 3, 4];

// ------------------------------------------------- 独立实现：字符级加/去两点

const DOT = { u: 'ü', 'ū': 'ǖ', 'ú': 'ǘ', 'ǔ': 'ǚ', 'ù': 'ǜ' };
const UNDOT = { 'ü': 'u', 'ǖ': 'ū', 'ǘ': 'ú', 'ǚ': 'ǔ', 'ǜ': 'ù' };

function withDots(syllable) {
    return syllable[0] + (DOT[syllable[1]] ?? syllable[1]) + syllable.slice(2);
}

function withoutDots(syllable) {
    return syllable[0] + (UNDOT[syllable[1]] ?? syllable[1]) + syllable.slice(2);
}

/** 把词表里的规范值按声调加两点（只在声母后的首个元音上） */
function canonicalValueDotted(abbr, tone) {
    return withDots(expectedValue(abbr, tone));
}

// ---------------------------------------------------------------- 默认行为

describe('两种拼写：默认输出规范形式', () => {
    it('字面输入默认投影为规范形式', () => {
        expect(toPinyinTones('jv1')).to.equal('jū');
        expect(toPinyinTones('jve2')).to.equal('jué');
        expect(toPinyinTones('jvan1')).to.equal('juān');
        expect(toPinyinTones('jvn4')).to.equal('jùn');
    });

    it('规范输入保持不变', () => {
        expect(toPinyinTones('ju1')).to.equal('jū');
        expect(toPinyinTones('jue2')).to.equal('jué');
        expect(toPinyinTones('juan1')).to.equal('juān');
        expect(toPinyinTones('jun4')).to.equal('jùn');
    });

    it('32 个字面键全部投影为规范形式', () => {
        expect(LITERAL_KEYS).to.have.length(32);
        for (const literal of LITERAL_KEYS) {
            const canonical = literal.replace('v', 'u');
            for (const tone of TONES) {
                expect(toPinyinTones(literal + tone)).to.equal(expectedValue(canonical, tone));
            }
        }
    });

    it('规范键逐条等于词表值', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                expect(toPinyinTones(canonical + tone)).to.equal(expectedValue(canonical, tone));
            }
        }
    });

    it('默认输出不含 ü（白名单 32 键 × 5 声调）', () => {
        for (const literal of LITERAL_KEYS) {
            for (const tone of TONES) {
                expect(toPinyinTones(literal + tone)).to.not.match(/[üǖǘǚǜ]/);
            }
        }
    });
});

// ---------------------------------------------------------------- 冒号拿字面

describe('两种拼写：冒号表示 u 上的两点', () => {
    it('一个冒号换一种拼写，其余完全相同', () => {
        expect(toPinyinTones('ju1 ju:1')).to.equal('jū jǖ');
        expect(toPinyinTones('juan1 juan:1')).to.equal('juān jüān');
    });

    it('32 个规范键都能用冒号取到字面形式', () => {
        for (const canonical of CANONICAL_KEYS) {
            const literal = canonical.replace('u', 'v');
            for (const tone of TONES) {
                expect(toPinyinTones(canonical + ':' + tone)).to.equal(expectedValue(literal, tone));
            }
        }
    });

    it('字面形式去两点后等于规范形式（32 键 × 5 声调）', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                const literal = toPinyinTones(canonical + ':' + tone);
                expect(literal).to.match(/[üǖǘǚǜ]/);
                expect(withoutDots(literal)).to.equal(toPinyinTones(canonical + tone));
            }
        }
    });

    it('冒号写在 v 上等同于写在 u 上（32 键 × 5 声调）', () => {
        // 规范写法是 u:；v 本来就是 ü 的 ASCII 写法，jv: 是同一请求的同义输入
        for (const literal of LITERAL_KEYS) {
            const canonical = literal.replace('v', 'u');
            for (const tone of TONES) {
                const viaU = toPinyinTones(canonical + ':' + tone);
                const viaV = toPinyinTones(literal + ':' + tone);
                expect(viaV, literal + ':' + tone).to.equal(viaU);
                expect(viaV).to.equal(expectedValue(literal, tone));
            }
        }
    });

    it('n/l 的 v: 与 u: 也等价', () => {
        expect(toPinyinTones('nv:3')).to.equal('nǚ');
        expect(toPinyinTones('nu:3')).to.equal('nǚ');
        expect(toPinyinTones('lv:4')).to.equal('lǜ');
        expect(toPinyinTones('nv:3 nvn:4')).to.equal('nǚ nǜn');
    });

    it('零声母 v: 就是 u:', () => {
        expect(toPinyinTones('v:')).to.equal('ü');
        expect(toPinyinTones('u:')).to.equal('ü');
        expect(toPinyinTones('v:1')).to.equal('ǖ');
        expect(toPinyinTones('v:4')).to.equal('ǜ');
    });

    it('冒号写在哪儿就是要哪儿的 ü，不看声母是否允许', () => {
        // 不规范的音节也照做：这个包既输出规范拼写，也输出不规范拼写
        expect(toPinyinTones('gu:1')).to.equal('gǖ');
        expect(toPinyinTones('gv:1')).to.equal('gǖ');
        expect(toPinyinTones('shv:3')).to.equal('shǚ');
        expect(toPinyinTones('u:e1')).to.equal('üē');
    });

    it('词表这一格没把 v 当 ü 时仍然不转', () => {
        // vai / vv / vu 的值是 vāi / vü / vu，输出里会留着辅音字母 v
        expect(toPinyinTones('vai:1')).to.equal('vai:1');
        expect(toPinyinTones('vv:1')).to.equal('vv:1');
        expect(toPinyinTones('vu:1')).to.equal('vu:1');
    });

    it('冒号与规范值的差别恰好是两点', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                expect(toPinyinTones(canonical + ':' + tone))
                    .to.equal(canonicalValueDotted(canonical, tone));
            }
        }
    });
});

// ---------------------------------------------------------------- 不越界

describe('两种拼写：投影不能越过白名单', () => {
    it('n/l 的 ü 保留两点（本来就不省）', () => {
        const nlKeys = ['nv', 'nve', 'nvan', 'nvn', 'nvr', 'nver', 'nvanr', 'nvnr',
                        'lv', 'lve', 'lvan', 'lvn', 'lvr', 'lver', 'lvanr', 'lvnr'];
        expect(nlKeys).to.have.length(16);
        for (const key of nlKeys) {
            for (const tone of TONES) {
                expect(toPinyinTones(key + tone)).to.equal(expectedValue(key, tone));
            }
        }
    });

    it('n/l 的 u 形式不会被当成 ü（nu != nv）', () => {
        for (const key of ['nu', 'nue', 'nuan', 'nun', 'lu', 'lue', 'luan', 'lun']) {
            for (const tone of TONES) {
                expect(toPinyinTones(key + tone)).to.equal(expectedValue(key, tone));
            }
        }
    });

    it('假音节 jui/jua/juo 等不会被当成 jü', () => {
        const fakes = Object.keys(dict).filter(
            (k) => /^[jqxy]u/.test(k) && !CANONICAL_KEYS.includes(k)
        );
        expect(fakes.length).to.be.greaterThan(0);
        for (const key of fakes) {
            for (const tone of TONES) {
                expect(toPinyinTones(key + tone)).to.equal(expectedValue(key, tone));
            }
        }
    });

    it('全表扫描：白名单之外的值与词表逐条一致', () => {
        // 词表里每个键都能被输入语法命中（纯小写字母，或 e^），所以整表都扫。
        const allowedToChange = new Set([...LITERAL_KEYS, ...CANONICAL_KEYS]);
        for (const key of Object.keys(dict)) {
            if (allowedToChange.has(key)) continue;
            for (const tone of TONES) {
                expect(toPinyinTones(key + tone), key + tone).to.equal(expectedValue(key, tone));
            }
        }
    });
});

// ---------------------------------------------------------------- 无全局开关
// 函数只吃一个参数，拼写不随参数变化，唯一的影响来源是 token 自己写的冒号。

describe('两种拼写：没有全局开关', () => {
    it('规范化对每个 token 独立成立，与调用次数无关', () => {
        expect(toPinyinTones('jv1 ju1 ju:1')).to.equal('jū jū jǖ');
        expect(toPinyinTones('jv1 ju1 ju:1')).to.equal(
            ['jv1', 'ju1', 'ju:1'].map((t) => toPinyinTones(t)).join(' ')
        );
    });
});

// ---------------------------------------------------------------- 透传

describe('两种拼写：convertUnspacedPinyin', () => {
    it('字面输入输出规范形式', () => {
        expect(convertUnspacedPinyin('jv1')).to.equal('jū');
        expect(convertUnspacedPinyin('jv1nv3')).to.equal('jūnǚ');
    });

    it('冒号同样生效', () => {
        expect(convertUnspacedPinyin('ju:1nv3')).to.equal('jǖnǚ');
    });

    it('多音节句子逐 token 决定拼写', () => {
        expect(toPinyinTones('jv1 nv3 ju:1')).to.equal('jū nǚ jǖ');
    });
});

// ---------------------------------------------------------------- 一次取两种

describe('两种拼写：toPinyinTonesVariants 一次返回两种', () => {
    it('字面输入同时给出规范与字面', () => {
        expect(toPinyinTonesVariants('jv1')).to.deep.equal({ canonical: 'jū', literal: 'jǖ' });
        expect(toPinyinTonesVariants('ju1')).to.deep.equal({ canonical: 'jū', literal: 'jǖ' });
        expect(toPinyinTonesVariants('jvan1')).to.deep.equal({ canonical: 'juān', literal: 'jüān' });
        expect(toPinyinTonesVariants('jvn4')).to.deep.equal({ canonical: 'jùn', literal: 'jǜn' });
    });

    it('canonical 与逐个调用的默认结果一致（32 键 × 5 声调）', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                const input = canonical + tone;
                expect(toPinyinTonesVariants(input).canonical).to.equal(toPinyinTones(input));
            }
        }
    });

    it('literal 与冒号写法一致（32 键 × 5 声调）', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                expect(toPinyinTonesVariants(canonical + tone).literal)
                    .to.equal(toPinyinTones(canonical + ':' + tone));
            }
        }
    });

    it('literal 去两点后等于 canonical', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                const v = toPinyinTonesVariants(canonical + tone);
                expect(withoutDots(v.literal)).to.equal(v.canonical);
                expect(v.canonical).to.not.match(/[üǖǘǚǜ]/);
                expect(v.literal).to.match(/[üǖǘǚǜ]/);
            }
        }
    });

    it('n/l 的 ü 两种形式相同', () => {
        for (const key of ['nv', 'nve', 'nvan', 'nvn', 'lv', 'lve', 'lvan', 'lvn']) {
            for (const tone of TONES) {
                const v = toPinyinTonesVariants(key + tone);
                expect(v.canonical).to.equal(v.literal);
                expect(v.canonical).to.equal(expectedValue(key, tone));
            }
        }
    });

    it('不含 ü 的音节两种形式相同（全表扫描）', () => {
        const allowedToDiffer = new Set([...CANONICAL_KEYS, ...LITERAL_KEYS]);
        for (const key of Object.keys(dict)) {
            if (allowedToDiffer.has(key)) continue;
            for (const tone of TONES) {
                const v = toPinyinTonesVariants(key + tone);
                expect(v.canonical, key + tone).to.equal(v.literal);
            }
        }
    });

    it('多音节句子各自保持 token 边界', () => {
        expect(toPinyinTonesVariants('jv1 nv3 jvan2')).to.deep.equal({
            canonical: 'jū nǚ juán',
            literal: 'jǖ nǚ jüán',
        });
    });

    it('非拼音 token 原样出现在两边', () => {
        const v = toPinyinTonesVariants('jv1 hello 123');
        expect(v.canonical).to.equal('jū hello 123');
        expect(v.literal).to.equal('jǖ hello 123');
    });
});
