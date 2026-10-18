// test/test-umlaut-style.js
// j/q/x/y + ü 的两种拼写（规范 ju / 字面 jv）在输出层的区分测试。
//
// 核心约定：
//   同一音节的两种拼写必须都能输出，且由 umlaut 选项显式决定，而不是靠猜。
//   默认（'auto' / 'omit'）输出国标规范形式；'keep' 才输出保留两点的字面形式。
//
// 方法：实现层用「换查表键」做投影，测试层用「字符级替换」独立算出期望值。
// 两条路径不同，交叉验证才有效。
import { expect } from 'chai';
import toPinyinTones, { convertUnspacedPinyin, toPinyinTonesVariants } from '../v2/index.js';
import dict from '../v2/dict.js';

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
    return withDots(dict[abbr][tone]);
}

// ---------------------------------------------------------------- 默认行为

describe('v2 ü 风格：默认输出规范形式（auto）', () => {
    it('字面输入默认投影为规范形式', () => {
        expect(toPinyinTones('jv1')).to.equal('jū');
        expect(toPinyinTones('jve2')).to.equal('jué');
        expect(toPinyinTones('jvan1')).to.equal('juān');
        expect(toPinyinTones('jvn4')).to.equal('jùn');
    });

    it('规范输入默认保持不变', () => {
        expect(toPinyinTones('ju1')).to.equal('jū');
        expect(toPinyinTones('jue2')).to.equal('jué');
        expect(toPinyinTones('juan1')).to.equal('juān');
        expect(toPinyinTones('jun4')).to.equal('jùn');
    });

    it('默认输出不含 ü', () => {
        for (const literal of LITERAL_KEYS) {
            for (const tone of TONES) {
                expect(toPinyinTones(literal + tone)).to.not.match(/[üǖǘǚǜ]/);
            }
        }
    });

    it('不传 options 与 { umlaut: "auto" } 逐条一致', () => {
        for (const key of Object.keys(dict)) {
            for (const tone of TONES) {
                const input = key + tone;
                expect(toPinyinTones(input, { umlaut: 'auto' })).to.equal(toPinyinTones(input));
            }
        }
    });

    it('auto 与 omit 完全等价（全表）', () => {
        for (const key of Object.keys(dict)) {
            for (const tone of TONES) {
                const input = key + tone;
                expect(toPinyinTones(input, { umlaut: 'auto' }))
                    .to.equal(toPinyinTones(input, { umlaut: 'omit' }));
            }
        }
    });
});

// ---------------------------------------------------------------- 强制规范

describe('v2 ü 风格：omit 强制规范（省两点）', () => {
    it('32 个字面键全部投影为规范形式', () => {
        expect(LITERAL_KEYS).to.have.length(32);
        for (const literal of LITERAL_KEYS) {
            const canonical = literal.replace('v', 'u');
            for (const tone of TONES) {
                expect(toPinyinTones(literal + tone, { umlaut: 'omit' }))
                    .to.equal(dict[canonical][tone]);
            }
        }
    });

    it('omit 的输出不含 ü', () => {
        for (const literal of LITERAL_KEYS) {
            for (const tone of TONES) {
                expect(toPinyinTones(literal + tone, { umlaut: 'omit' })).to.not.match(/[üǖǘǚǜ]/);
            }
        }
    });

    it('规范输入在 omit 下保持不变', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                expect(toPinyinTones(canonical + tone, { umlaut: 'omit' }))
                    .to.equal(dict[canonical][tone]);
            }
        }
    });
});

// ---------------------------------------------------------------- 强制字面

describe('v2 ü 风格：keep 强制保留两点', () => {
    it('32 个规范键全部投影为字面形式', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                expect(toPinyinTones(canonical + tone, { umlaut: 'keep' }))
                    .to.equal(canonicalValueDotted(canonical, tone));
            }
        }
    });

    it('keep 的输出必定含 ü', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                expect(toPinyinTones(canonical + tone, { umlaut: 'keep' })).to.match(/[üǖǘǚǜ]/);
            }
        }
    });

    it('字面输入在 keep 下保持不变', () => {
        for (const literal of LITERAL_KEYS) {
            for (const tone of TONES) {
                expect(toPinyinTones(literal + tone, { umlaut: 'keep' }))
                    .to.equal(dict[literal][tone]);
            }
        }
    });
});

// ---------------------------------------------------------------- 互斥与往返

describe('v2 ü 风格：两种输出必须不同且可往返', () => {
    it('同一音节在 keep / omit 下结果不同', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                const kept = toPinyinTones(canonical + tone, { umlaut: 'keep' });
                const omitted = toPinyinTones(canonical + tone, { umlaut: 'omit' });
                expect(kept).to.not.equal(omitted);
            }
        }
    });

    it('omit 的结果去两点后与规范值一致', () => {
        for (const literal of LITERAL_KEYS) {
            const canonical = literal.replace('v', 'u');
            for (const tone of TONES) {
                const omitted = toPinyinTones(literal + tone, { umlaut: 'omit' });
                expect(withoutDots(omitted)).to.equal(dict[canonical][tone]);
            }
        }
    });

    it('keep 的结果与 omit 的结果只差两点', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                const kept = toPinyinTones(canonical + tone, { umlaut: 'keep' });
                const omitted = toPinyinTones(canonical + tone, { umlaut: 'omit' });
                expect(withoutDots(kept)).to.equal(omitted);
            }
        }
    });
});

// ---------------------------------------------------------------- 不越界

describe('v2 ü 风格：投影不能越过白名单', () => {
    it('n/l 的 ü 在三种模式下都保留两点', () => {
        const nlKeys = ['nv', 'nve', 'nvan', 'nvn', 'nvr', 'nver', 'nvanr', 'nvnr',
                        'lv', 'lve', 'lvan', 'lvn', 'lvr', 'lver', 'lvanr', 'lvnr'];
        expect(nlKeys).to.have.length(16);
        for (const key of nlKeys) {
            for (const tone of TONES) {
                for (const style of ['auto', 'keep', 'omit']) {
                    expect(toPinyinTones(key + tone, { umlaut: style })).to.equal(dict[key][tone]);
                }
            }
        }
    });

    it('n/l 的 u 形式不会被 keep 变成 ü（nu != nv）', () => {
        for (const key of ['nu', 'nue', 'nuan', 'nun', 'lu', 'lue', 'luan', 'lun']) {
            for (const tone of TONES) {
                expect(toPinyinTones(key + tone, { umlaut: 'keep' })).to.equal(dict[key][tone]);
            }
        }
    });

    it('假音节 jui/jua/juo 等不会被 keep 误转', () => {
        const fakes = Object.keys(dict).filter(
            (k) => /^[jqxy]u/.test(k) && !CANONICAL_KEYS.includes(k)
        );
        expect(fakes.length).to.be.greaterThan(0);
        for (const key of fakes) {
            for (const tone of TONES) {
                expect(toPinyinTones(key + tone, { umlaut: 'keep' })).to.equal(dict[key][tone]);
            }
        }
    });

    it('全表扫描：白名单之外的值在 keep / omit 下与 auto 完全一致', () => {
        const allowedToChange = new Set([...LITERAL_KEYS, ...CANONICAL_KEYS]);
        for (const key of Object.keys(dict)) {
            if (allowedToChange.has(key)) continue;
            for (const tone of TONES) {
                const input = key + tone;
                const base = toPinyinTones(input);
                expect(toPinyinTones(input, { umlaut: 'keep' }), `keep ${input}`).to.equal(base);
                expect(toPinyinTones(input, { umlaut: 'omit' }), `omit ${input}`).to.equal(base);
            }
        }
    });
});

// ---------------------------------------------------------------- 输入校验

describe('v2 ü 风格：参数校验', () => {
    it('非法 umlaut 值抛 TypeError', () => {
        expect(() => toPinyinTones('ni3', { umlaut: 'canonical' })).to.throw(TypeError, /umlaut must be one of/);
        expect(() => toPinyinTones('ni3', { umlaut: '' })).to.throw(TypeError);
        expect(() => toPinyinTones('ni3', { umlaut: null })).to.throw(TypeError);
    });

    it('合法值不抛错', () => {
        for (const style of ['auto', 'keep', 'omit']) {
            expect(() => toPinyinTones('ni3', { umlaut: style })).to.not.throw();
        }
    });
});

// ---------------------------------------------------------------- 透传

describe('v2 ü 风格：convertUnspacedPinyin 透传选项', () => {
    it('字面输入默认输出规范形式，keep 才保留两点', () => {
        expect(convertUnspacedPinyin('jv1')).to.equal('jū');
        expect(convertUnspacedPinyin('jv1', { umlaut: 'omit' })).to.equal('jū');
        expect(convertUnspacedPinyin('jv1', { umlaut: 'keep' })).to.equal('jǖ');
    });

    it('规范输入在 keep 下输出保留两点', () => {
        expect(convertUnspacedPinyin('ju1', { umlaut: 'keep' })).to.equal('jǖ');
        expect(convertUnspacedPinyin('ju1')).to.equal('jū');
    });

    it('多音节句子逐 token 保持风格', () => {
        expect(toPinyinTones('jv1 nv3')).to.equal('jū nǚ');
        expect(toPinyinTones('jv1 nv3', { umlaut: 'omit' })).to.equal('jū nǚ');
        expect(toPinyinTones('ju1 nv3', { umlaut: 'keep' })).to.equal('jǖ nǚ');
        expect(toPinyinTones('ju1 nv3', { umlaut: 'omit' })).to.equal('jū nǚ');
    });
});

// ---------------------------------------------------------------- 一次取两种

describe('v2 ü 风格：toPinyinTonesVariants 一次返回两种', () => {
    it('字面输入同时给出规范与字面', () => {
        expect(toPinyinTonesVariants('jv1')).to.deep.equal({ canonical: 'jū', literal: 'jǖ' });
        expect(toPinyinTonesVariants('ju1')).to.deep.equal({ canonical: 'jū', literal: 'jǖ' });
        expect(toPinyinTonesVariants('jvan1')).to.deep.equal({ canonical: 'juān', literal: 'jüān' });
        expect(toPinyinTonesVariants('jvn4')).to.deep.equal({ canonical: 'jùn', literal: 'jǜn' });
    });

    it('与分别传 omit / keep 完全等价（32 键 × 5 声调）', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                const input = canonical + tone;
                const v = toPinyinTonesVariants(input);
                expect(v.canonical).to.equal(toPinyinTones(input, { umlaut: 'omit' }));
                expect(v.literal).to.equal(toPinyinTones(input, { umlaut: 'keep' }));
            }
        }
    });

    it('literal 去两点后等于 canonical（32 键 × 5 声调）', () => {
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
                expect(v.canonical).to.equal(dict[key][tone]);
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
