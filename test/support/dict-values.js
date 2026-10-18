// test/support/dict-values.js
// v2/dict.js 只存每个音节的**无调形式**，四个声调由 v2/index.js 在运行时加上。
// 测试需要独立的期望值，所以这里把标调再实现一遍：
//
//   生产代码：indexOf 循环，依次找 a / o / e，找不到再倒着扫 i/u/ü，最后先查
//             鼻音闭集表、查不到再按规则落到倒数第一个鼻音上。
//   这里：三条正则，靠位置扫描 + 负数前瞻挑出主元音 / 最后一个鼻音，
//         鼻音闭集另抄一份做优先。
//
// 两条路径写法不同，交叉验证才有意义。规则本身是一样的（《汉语拼音方案》的
// 标调规则）：有 a 标 a，无 a 有 o 标 o，无 a/o 有 e 标 e，否则标最后一个元音。
// 一个元音都没有的叹词音节标在最后一个鼻音上（m3 -> m̌、hng2 -> hńg）。
import dict from '../../v2/dict.js';

// 用数组做索引：调号里出现「字母 + 组合符」两个码位时，按字符串下标会取到半个字符。
const MARKS = {
    a: ['ā', 'á', 'ǎ', 'à'],
    o: ['ō', 'ó', 'ǒ', 'ò'],
    e: ['ē', 'é', 'ě', 'è'],
    i: ['ī', 'í', 'ǐ', 'ì'],
    u: ['ū', 'ú', 'ǔ', 'ù'],
    'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    m: ['m\u0304', 'ḿ', 'm\u030c', 'm\u0300'],
    n: ['n\u0304', 'ń', 'ň', 'ǹ'],
};

// 先试 a/o/e；否则取一个后面再也没有元音的 i/u/ü —— 即最后一个元音。
// iu -> u、ui -> i 由「后面没有元音」自动满足。
const MAIN_VOWEL = /a|o|e|[iuü](?![aoeiuü])/;

// 一个元音都没有时，取后面不再出现 m/n 的那个 m/n —— 即最后一个鼻音。
// hng -> 标 n（hńg）、hm -> 标 m（hḿ）、ng -> 标 n（ńg）。
const LAST_NASAL = /[mn](?![a-z]*[mn])/;

// 词典里真实出现过的叹词带调组合，优先于规则。字形与 v2/index.js 的
// NASAL_TONES 相互独立地抄写，两边对不上就说明有人改错了。
// m 缺第三声，n 与 ng 缺第一声，hm / hng 只有无调 —— 这些格子由规则补。
const NASAL_TONES = {
    m: {1: 'm\u0304', 2: 'ḿ', 4: 'm\u0300'},
    n: {2: 'ń', 3: 'ň', 4: 'ǹ'},
    ng: {2: 'ńg', 3: 'ňg', 4: 'ǹg'},
    hm: {},
    hng: {},
};

/** 词表里的无调形式，键不存在时抛错（测试里出现笔误要立刻炸） */
export function baseOf(key) {
    const base = dict[key];
    if (base === undefined) throw new Error(`dict 里没有这个键: ${key}`);
    return base;
}

/**
 * 给无调形式加上第 tone 声（0 为轻声，不加调号）。
 *
 * 拆不出调号的音节返回 input —— 调用方传进来的原始输入，默认 `key + tone`。
 * 这样「期望值」永远是一个可以直接跟字符串比的输出，不必在调用点到处判 null。
 */
export function expectedValue(key, tone, input = key + tone) {
    const base = baseOf(key);
    if (tone === 0) return base;

    const match = MAIN_VOWEL.exec(base) || LAST_NASAL.exec(base);
    if (!match) return input;

    const listed = NASAL_TONES[base]?.[tone];
    if (listed) return listed;

    const at = match.index;
    return base.slice(0, at) + MARKS[base[at]][tone - 1] + base.slice(at + 1);
}
