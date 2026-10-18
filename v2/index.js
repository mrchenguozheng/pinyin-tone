'use strict';
import pinyin_dict_v2 from './dict.js';

// 整串必须完全匹配：纯小写字母 + 可选的「两点标记」+ 可选声调数字。
// 不加锚点会静默截断输入（"ni3hao3" -> "nǐ"、"ma6" -> "ma"），
// 大写字母还会被跳过而错位匹配（"Hao3" -> "ǎo"）。
const regex = /^(?<abc>[a-z]+)(?<mark>:?)(?<num>[0-5]?)$/;

// u: 里的冒号代表 ü 上面的两点：ju:1 读作 jü + 第一声，输出 jǖ。
// 这是给美式键盘准备的 —— 不离开 ASCII 就能写出保留两点的形式。

// ---------------------------------------------------------------- ü 的两种写法
//
// 同一个音节在「j/q/x/y + ü」上有两种拼写：
//   规范（国标）  ju  jue  juan  jun   ← j/q/x/y 与 ü 相拼时省两点
//   字面（保留）  jv  jve  jvan  jvn   ← 词表里用 v 表示 ü（ASCII 输入约定）
// 二者是同一音位的两种写法，不是两个音节，因此可以互相投影而不丢信息。
//
// 只对 j/q/x/y 成立：这四个声母后的 u 永远不是真正的 u（互补分布）。
// n/l 后的 u 与 ü 是对立音位（nǔ 努 / nǚ 女、lù 路 / lǜ 绿），不能投影。
const UMLAUT_HEADS = 'jqxy';

// 可省的韵母：ü / üe / üan / ün，及其儿化变体。必须穷举成闭集，
// 不能用 /^u/ 之类的前缀匹配 —— 词表里还有 jui/jua/juo/juai/juei/juen/
// juang/jueng 这类笛卡尔积产生的假音节，前缀匹配会把它们误转成 jüí/jüá。
const UMLAUT_FINALS = new Set(['u', 'ue', 'uan', 'un', 'ur', 'uer', 'uanr', 'unr']);

const UMLAUT_STYLES = new Set(['auto', 'keep', 'omit', 'as-written']);

/**
 * 字面写法 -> 规范写法（jv -> ju）。仅在白名单内生效。
 * @param {string} abbr
 * @returns {string}
 */
function toCanonicalSpelling(abbr) {
    if (abbr.length >= 2 && UMLAUT_HEADS.includes(abbr[0]) && abbr[1] === 'v'
        && UMLAUT_FINALS.has('u' + abbr.slice(2))) {
        return abbr[0] + 'u' + abbr.slice(2);
    }
    return abbr;
}

/**
 * 规范写法 -> 字面写法（ju -> jv）。仅在白名单内生效。
 * @param {string} abbr
 * @returns {string}
 */
function toLiteralSpelling(abbr) {
    if (abbr.length >= 2 && UMLAUT_HEADS.includes(abbr[0]) && abbr[1] === 'u'
        && UMLAUT_FINALS.has(abbr.slice(1))) {
        return abbr[0] + 'v' + abbr.slice(2);
    }
    return abbr;
}

/**
 * 按 umlaut 选项决定查表用哪个键。
 *   auto（默认）/ omit : 输出规范形式，j/q/x/y 后的 ü 一律省两点（jū）
 *   keep              : 输出字面形式，一律保留两点（jǖ）
 *   as-written        : 跟随这一处输入的写法，jv 得 jǖ、ju 得 jū
 * 默认必须是规范形式：省两点是国标要求，`jǖ` 只有明确要字面写法时才该出现。
 * auto 与 omit 等价，保留 auto 只是让「不传参数」有个名字。
 * as-written 用于同一段文字里并排展示两种写法的场景，风格按 token 各自决定，
 * 而不是整段统一 —— 这是它和另外三种的本质区别。
 * @param {string} abbr
 * @param {'auto'|'keep'|'omit'|'as-written'} style
 * @returns {string}
 */
function resolveSpelling(abbr, style) {
    if (style === 'as-written') return abbr;
    if (style === 'keep') return toLiteralSpelling(abbr);
    return toCanonicalSpelling(abbr);
}

/**
 * 按风格优先取某个键，其余拼写作为兜底。
 * 兜底是为了将来清掉冗余的 jv 键时不至于让 keep / as-written 直接失效。
 * @param {string} abbr
 * @param {'auto'|'keep'|'omit'|'as-written'} style
 * @returns {string[]|undefined}
 */
function lookupSyllables(abbr, style) {
    const candidates = style === 'as-written'
        ? [abbr, toCanonicalSpelling(abbr), toLiteralSpelling(abbr)]
        : style === 'keep'
            ? [toLiteralSpelling(abbr), toCanonicalSpelling(abbr)]
            : [toCanonicalSpelling(abbr), toLiteralSpelling(abbr)];

    for (const key of candidates) {
        const syllables = pinyin_dict_v2[key];
        if (syllables) return syllables;
    }
    return undefined;
}

/**
 * 空 / 0 / 5 都表示轻声，对应词表下标 0
 * @param {string} num
 * @returns {number}
 */
function toneIndex(num) {
    return num === '' || num === '0' || num === '5' ? 0 : Number(num);
}

function normalizeOptions(options) {
    const raw = options?.umlaut;
    // 只有 undefined 表示「没传」，null 也算显式给了一个非法值
    const style = raw === undefined ? 'auto' : raw;
    if (!UMLAUT_STYLES.has(style)) {
        throw new TypeError(
            `umlaut must be one of ${[...UMLAUT_STYLES].map((s) => `'${s}'`).join(', ')}, got ${JSON.stringify(style)}`
        );
    }
    return style;
}

/**
 * 查表并取对应声调。不成词时返回 null，由调用方决定回退成什么。
 * @param {string} abc
 * @param {string} num
 * @param {'auto'|'keep'|'omit'|'as-written'} style
 * @returns {string|null}
 */
function renderSyllable(abc, num, style) {
    const syllables = lookupSyllables(abc, style);
    if (!syllables) return null;
    return syllables[toneIndex(num)] ?? null;
}

/**
 * 把 ju:1 里的冒号还原成两点：找到音节里的第一个 u，换成 ü，再用词表的 v 键。
 *   ju:1 -> jü -> jv      juan:1 -> jüan -> jvan
 *   nu:3 -> nü -> nv      u:1    -> ü    -> v
 *
 * 只允许 ü 真正能出现的声母（n/l/j/q/x/y 与零声母）。词表是按「声母 × 韵母」
 * 笛卡尔积生成的，里面还有 gv、shv 这类 217 个虚构键，不挡的话 gu:1 会输出
 * 一个不存在的 gǖ。音节里没有 u（ji:1、ma:1）时同理返回 null，调用方原样返回。
 * @param {string} abc
 * @returns {string|null}
 */
function dottedKey(abc) {
    const i = abc.indexOf('u');
    if (i === -1) return null;

    const head = abc.slice(0, i);
    if (head === '') {
        // 零声母里只有单个 u 有意义（u: -> ü）；uang/uer 之类不是音节
        if (abc !== 'u') return null;
    } else if (!'nljqxy'.includes(head)) {
        return null;
    }

    return (abc.slice(0, i) + 'ü' + abc.slice(i + 1)).replace('ü', 'v');
}

/**
 * 冒号标记优先于 umlaut 选项：写了 ju:1 就是要 jǖ，不管默认是哪种风格。
 * @param {string} abc
 * @param {string} mark
 * @param {string} num
 * @param {'auto'|'keep'|'omit'|'as-written'} style
 * @returns {string|null}
 */
function renderToken(abc, mark, num, style) {
    if (mark !== ':') return renderSyllable(abc, num, style);

    const key = dottedKey(abc);
    return key ? renderSyllable(key, num, 'keep') : null;
}

/**
 * @param {string} longString
 * @param {{ umlaut?: 'auto'|'keep'|'omit'|'as-written' }} [options]
 * @return {string}
 */
function toPinyinTones(longString, options) {
    const style = normalizeOptions(options);
    const stringArray = longString.trim().split(' ');

    return stringArray.map((str) => {
        const match = regex.exec(str);

        // 不是完整的拼音串（大写、标点、多音节连写、非法声调）-> 原样返回，与 v1 行为一致
        if (!match) {
            return str; // is NOT pinyin
        }

        return renderToken(match.groups.abc, match.groups.mark, match.groups.num, style) ?? str;
    }).join(' ');
}

/**
 * 混排文本里的拼音片段：前后必须是非 ASCII 字母数字（中文、标点、空白都算边界）。
 * 没有边界的话，"abcju1" 这种英文单词内部会被切开当成拼音。
 */
const inlineToken = /(?<![A-Za-z0-9_])([a-z]+)(:?)([0-5]?)(?![A-Za-z0-9_])/g;

/**
 * 转换中文与拼音混排的整句：只替换其中的拼音片段，其余字符逐字保留。
 * 与 toPinyinTones 的区别是分词方式 —— 这里不按空格切，而是在整段里扫。
 *
 * 裸写（ju1 / jv1）按 umlaut 选项输出，默认规范形式 jū；
 * 在 u 后面加一个英文冒号（ju:1）表示这个 u 带两点，输出 jǖ。
 * 冒号就是 ü 上面那两点，整段输入因此可以全部用美式键盘敲出。
 * @param {string} text
 * @param {{ umlaut?: 'auto'|'keep'|'omit'|'as-written' }} [options]
 * @returns {string}
 */
function toPinyinTonesInline(text, options) {
    const style = normalizeOptions(options);

    return text.replace(inlineToken, (whole, abc, mark, num) => {
        // 不成词（单独的 j、英文单词）-> 原样保留
        return renderToken(abc, mark, num, style) ?? whole;
    });
}

/**
 * split syllables string by number
 * @param {string} text
 * @returns {string}
 */
function splitUnspacedSyllables(text){
    // insert a separator between each number
    return text.replace(/(\d)/g, '$1 ') // add space after each number
    .replace(/\s+/g, ' ') // remove multiple spaces
    .trim() // remove leading and trailing spaces
}

/**
 * output pinyin string without space like "hànyǔpīnyīn"
 * @param {string} unspacedSyllables unspaced pinyin string like "han4yu3pin1yin1"
 * @param {{ umlaut?: 'auto'|'keep'|'omit' }} [options]
 * @returns {string}
 */
function convertUnspacedPinyin(unspacedSyllables, options){
    return toPinyinTones(splitUnspacedSyllables(unspacedSyllables), options).split(' ').join('')
}

/**
 * 同时给出同一输入的规范形式与字面形式。
 * 只有 j/q/x/y 后的 ü 会不同，n/l 两边一样（nǚ / lǜ 在两种形式下都保留两点）。
 * @param {string} longString
 * @returns {{ canonical: string, literal: string }}
 */
function toPinyinTonesVariants(longString) {
    return {
        canonical: toPinyinTones(longString, { umlaut: 'omit' }),
        literal: toPinyinTones(longString, { umlaut: 'keep' }),
    };
}

export default toPinyinTones;
export {splitUnspacedSyllables};
export {convertUnspacedPinyin};
export {toPinyinTonesVariants};
export {toPinyinTonesInline};
