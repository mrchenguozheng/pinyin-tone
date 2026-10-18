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
import {markTones} from '../lib/index.js';
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
        expect(markTones('jv1')).to.equal('jū');
        expect(markTones('jve2')).to.equal('jué');
        expect(markTones('jvan1')).to.equal('juān');
        expect(markTones('jvn4')).to.equal('jùn');
    });

    it('规范输入保持不变', () => {
        expect(markTones('ju1')).to.equal('jū');
        expect(markTones('jue2')).to.equal('jué');
        expect(markTones('juan1')).to.equal('juān');
        expect(markTones('jun4')).to.equal('jùn');
    });

    it('32 个字面键全部投影为规范形式', () => {
        expect(LITERAL_KEYS).to.have.length(32);
        for (const literal of LITERAL_KEYS) {
            const canonical = literal.replace('v', 'u');
            for (const tone of TONES) {
                expect(markTones(literal + tone)).to.equal(expectedValue(canonical, tone));
            }
        }
    });

    it('规范键逐条等于词表值', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                expect(markTones(canonical + tone)).to.equal(expectedValue(canonical, tone));
            }
        }
    });

    it('默认输出不含 ü（白名单 32 键 × 5 声调）', () => {
        for (const literal of LITERAL_KEYS) {
            for (const tone of TONES) {
                expect(markTones(literal + tone)).to.not.match(/[üǖǘǚǜ]/);
            }
        }
    });
});

// ---------------------------------------------------------------- 冒号拿字面

describe('两种拼写：冒号表示 u 上的两点', () => {
    it('一个冒号换一种拼写，其余完全相同', () => {
        expect(markTones('ju1 ju:1')).to.equal('jū jǖ');
        expect(markTones('juan1 juan:1')).to.equal('juān jüān');
    });

    it('32 个规范键都能用冒号取到字面形式', () => {
        for (const canonical of CANONICAL_KEYS) {
            const literal = canonical.replace('u', 'v');
            for (const tone of TONES) {
                expect(markTones(canonical + ':' + tone)).to.equal(expectedValue(literal, tone));
            }
        }
    });

    it('字面形式去两点后等于规范形式（32 键 × 5 声调）', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                const literal = markTones(canonical + ':' + tone);
                expect(literal).to.match(/[üǖǘǚǜ]/);
                expect(withoutDots(literal)).to.equal(markTones(canonical + tone));
            }
        }
    });

    it('冒号写在 v 上等同于写在 u 上（32 键 × 5 声调）', () => {
        // 规范写法是 u:；v 本来就是 ü 的 ASCII 写法，jv: 是同一请求的同义输入
        for (const literal of LITERAL_KEYS) {
            const canonical = literal.replace('v', 'u');
            for (const tone of TONES) {
                const viaU = markTones(canonical + ':' + tone);
                const viaV = markTones(literal + ':' + tone);
                expect(viaV, literal + ':' + tone).to.equal(viaU);
                expect(viaV).to.equal(expectedValue(literal, tone));
            }
        }
    });

    it('n/l 的 v: 与 u: 也等价', () => {
        expect(markTones('nv:3')).to.equal('nǚ');
        expect(markTones('nu:3')).to.equal('nǚ');
        expect(markTones('lv:4')).to.equal('lǜ');
        expect(markTones('nv:3 nvn:4')).to.equal('nǚ nǜn');
    });

    it('零声母 v: 就是 u:', () => {
        expect(markTones('v:')).to.equal('ü');
        expect(markTones('u:')).to.equal('ü');
        expect(markTones('v:1')).to.equal('ǖ');
        expect(markTones('v:4')).to.equal('ǜ');
    });

    it('冒号写在哪儿就是要哪儿的 ü，不看声母是否允许', () => {
        // 不规范的音节也照做：这个包既输出规范拼写，也输出不规范拼写
        expect(markTones('gu:1')).to.equal('gǖ');
        expect(markTones('gv:1')).to.equal('gǖ');
        expect(markTones('shv:3')).to.equal('shǚ');
        expect(markTones('u:e1')).to.equal('üē');
    });

    it('冒号只认两个位置：承载位之后，或音节末尾', () => {
        // 承载位之后 —— 冒号主张这两点属于紧邻的那个 u/v，其后的字母仍属同一韵母
        expect(markTones('ju:an1')).to.equal('jüān');
        expect(markTones('jv:an1')).to.equal('jüān');
        expect(markTones('lu:e4')).to.equal('lüè');

        // 音节末尾 —— 缩写形式，冒号与承载位之间可以隔着韵母剩下的字母
        expect(markTones('juan:1')).to.equal('jüān');
        expect(markTones('jvan:1')).to.equal('jüān');

        // 两种位置求的是同一件事
        expect(markTones('jv:an1')).to.equal(markTones('jvan:1'));

        // 其余位置不猜：冒号既不在承载位后、也不在末尾，整串原样。
        // 这几条原本都能转换（j:van1 -> jüān），收紧后归入「写错了」。
        for (const input of ['j:van1', 'j:uan1', 'jva:n1', 'jua:n1', 'n:ue4', 'l:ve4']) {
            expect(markTones(input), input).to.equal(input);
        }
    });

    it('冒号落在 v 上、这一格又没把 v 当 ü 时，输出等于裸写', () => {
        // 三格的词表值是 v-a-i / v-ü / v-u，落点那个 v 是辅音，冒号换不动它。
        // 冒号不制造「失败」状态：换不动就按这一格本来的拼写输出，
        // 于是一个 v 上的冒号只是把同一件事又说了一遍 —— vv:1 就是 vv1。
        expect(markTones('vai:1')).to.equal(markTones('vai1'));
        expect(markTones('vv:1')).to.equal(markTones('vv1'));
        expect(markTones('vu:1')).to.equal(markTones('vu1'));

        expect(markTones('vai:1')).to.equal('vāi');
        expect(markTones('vv:1')).to.equal('vǖ');
        expect(markTones('vu:1')).to.equal('vū');
    });

    it('值里只剩半个 ü 的八格同样只是裸写的同义词', () => {
        // 这八格的值是 vü / vüe / vüan / vün …：第二个 v 已经转成 ü，
        // 冒号落在第一个 v 上换不动，于是输出与裸写逐字相同。
        const halfDotted = ['vv', 'vve', 'vvan', 'vvn', 'vvr', 'vver', 'vvanr', 'vvnr'];
        for (const key of halfDotted) {
            expect(markTones(key + ':1'), key).to.equal(markTones(key + '1'));
        }

        // strict 下这些格子本来就不成词，各自逐字原样 ——「原样」保留
        // 用户写的冒号，与 jui:1 的处理一致，不因为这条规则去掉冒号。
        expect(markTones('vv1', {strict: true})).to.equal('vv1');
        expect(markTones('vv:1', {strict: true})).to.equal('vv:1');
    });

    it('冒号与规范值的差别恰好是两点', () => {
        for (const canonical of CANONICAL_KEYS) {
            for (const tone of TONES) {
                expect(markTones(canonical + ':' + tone))
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
                expect(markTones(key + tone)).to.equal(expectedValue(key, tone));
            }
        }
    });

    it('n/l 的 u 形式不会被当成 ü（nu != nv）', () => {
        for (const key of ['nu', 'nue', 'nuan', 'nun', 'lu', 'lue', 'luan', 'lun']) {
            for (const tone of TONES) {
                expect(markTones(key + tone)).to.equal(expectedValue(key, tone));
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
                expect(markTones(key + tone)).to.equal(expectedValue(key, tone));
            }
        }
    });

    it('全表扫描：白名单之外的值与词表逐条一致', () => {
        // 词表里每个键都能被输入语法命中（纯小写字母，或 e^），所以整表都扫。
        const allowedToChange = new Set([...LITERAL_KEYS, ...CANONICAL_KEYS]);
        for (const key of Object.keys(dict)) {
            if (allowedToChange.has(key)) continue;
            for (const tone of TONES) {
                expect(markTones(key + tone), key + tone).to.equal(expectedValue(key, tone));
            }
        }
    });
});

// ---------------------------------------------------------------- 无全局开关
// 拼写不随参数变化，唯一的影响来源是 token 自己写的冒号 —— strict 只决定
// 「认不认这个音节」，skip 只决定「这一段要不要动」，两者都不改拼写。

describe('两种拼写：token 的输出与上下文无关', () => {
    // 拼写由 token 自己决定，所以它在句首、句尾、夹在中间、单独调用都应该一样。
    // 这比「整串结果 = 逐个调用结果再拼起来」强：那种写法左右都是同一个实现，
    // 只能证明自己等于自己；这里比的是同一 token 在四个位置上的输出。
    it('32 字面键 + 32 规范键 × 5 声调，四个位置结果一致', () => {
        for (const key of [...LITERAL_KEYS, ...CANONICAL_KEYS]) {
            for (const tone of TONES) {
                const input = key + tone;
                const alone = markTones(input);
                expect(markTones(`${input} ni3`), input).to.equal(`${alone} nǐ`);
                expect(markTones(`ni3 ${input}`), input).to.equal(`nǐ ${alone}`);
                expect(markTones(`ni3 ${input} hao3`), input).to.equal(`nǐ ${alone} hǎo`);
            }
        }
    });
});

// ---------------------------------------------------------------- 逐 token 决定
// 拼写由 token 自己决定，与 token 总数、调用次数都无关 ——
// 同一串里可以并排出现规范与字面两种写法。

describe('两种拼写：逐 token 决定', () => {
    it('多音节句子各自保持 token 边界', () => {
        expect(markTones('jv1 nv3 jvan2')).to.equal('jū nǚ juán');
        expect(markTones('jv1 nv3 jvan:2')).to.equal('jū nǚ jüán');
    });

    it('非拼音 token 原样留在原位，不影响两侧', () => {
        expect(markTones('jv1 hello 123 ju:1')).to.equal('jū hello 123 jǖ');
    });
});
