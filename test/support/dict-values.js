// test/support/dict-values.js
// v2/dict.js 只存每个音节的**无调形式**，四个声调由 v2/index.js 在运行时加上。
// 测试需要独立的期望值，所以这里把标调再实现一遍：
//
//   生产代码：indexOf 循环，依次找 a / o / e，找不到再倒着扫 i/u/ü。
//   这里：一条正则，靠位置扫描 + 负数前瞻挑出主元音。
//
// 两条路径写法不同，交叉验证才有意义。规则本身是一样的（《汉语拼音方案》的
// 标调规则）：有 a 标 a，无 a 有 o 标 o，无 a/o 有 e 标 e，否则标最后一个元音。
import dict from '../../v2/dict.js';

const MARKS = {
    a: 'āáǎà',
    o: 'ōóǒò',
    e: 'ēéěè',
    i: 'īíǐì',
    u: 'ūúǔù',
    'ü': 'ǖǘǚǜ',
};

// 先试 a/o/e；否则取一个后面再也没有元音的 i/u/ü —— 即最后一个元音。
// iu -> u、ui -> i 由「后面没有元音」自动满足。
const MAIN_VOWEL = /a|o|e|[iuü](?![aoeiuü])/;

/** 词表里的无调形式，键不存在时抛错（测试里出现笔误要立刻炸） */
export function baseOf(key) {
    const base = dict[key];
    if (base === undefined) throw new Error(`dict 里没有这个键: ${key}`);
    return base;
}

/** 给无调形式加上第 tone 声（0 为轻声，不加调号） */
export function expectedValue(key, tone) {
    const base = baseOf(key);
    if (tone === 0) return base;

    const match = MAIN_VOWEL.exec(base);
    if (!match) return base;

    const at = match.index;
    return base.slice(0, at) + MARKS[base[at]][tone - 1] + base.slice(at + 1);
}
