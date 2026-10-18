'use strict';
import pinyin_dict_v2 from './dict.js';

// 单个音节必须整串匹配：纯小写字母 + 可选的「两点标记」+ 可选声调数字。
// 不加锚点会静默截断输入（"ma6" -> "ma"），
// 大写字母还会被跳过而错位匹配（"Hao3" -> "ǎo"）。
const regex = /^(?<abc>[a-z]+)(?<mark>:?)(?<num>[0-5]?)$/;

// 连写分词用：一个 token 里可以有若干段「字母 + 可选冒号 + 可选后续字母 + 可选声调」。
// 贪婪的 [a-z]+ 靠声调数字断开，"ni3hao3" 于是自然切成 ni3 | hao3 ——
// 声调数字本来就是拼音连写里唯一可靠的分隔符，不需要音节层面的歧义消解。
//
// 冒号后面的字母（after）属于同一段：冒号只是「这个 u 带两点」的标记，
// 不是音节边界。"lu:e4" 因此读作 lü e + 第四声 = lüè，而不是 lü + é。
const segment = /(?<abc>[a-z]+)(?<mark>:?)(?<after>[a-z]*)(?<num>[0-5]?)/g;

// 音节之间只允许 ASCII 标点 / 空白。一旦间隙里出现字母、数字或汉字，
// 说明这个 token 不是「拼音串 + 标点」（英文单词、大小写混排、非法声调、
// 汉字混排都在此列），宁可整体原样，也不猜着往下切。
const foreign = /[A-Za-z0-9]|\p{Script=Han}/u;

// u: 里的冒号代表 ü 上面的两点：ju:1 读作 jü + 第一声，输出 jǖ。
// 这是给美式键盘准备的 —— 不离开 ASCII 就能写出保留两点的形式。
// 冒号前的 u 与 v 等价：jv:1 同义（v 本来就是 ü 的 ASCII 写法）。

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
 * 查表取某个音节的五个声调。先按请求的拼写查，查不到再用另一种拼写兜底：
 * j/q/x/y 后的 ü 在词表里两种键都有，投影是安全的；兜底则是为了将来
 * 清掉冗余的 jv 键时不至于让字面形式直接失效。
 * @param {string} abbr
 * @param {boolean} literal true 取字面拼写（jǖ），false 取规范拼写（jū）
 * @returns {string[]|undefined}
 */
function lookupSyllables(abbr, literal) {
    const keys = literal
        ? [toLiteralSpelling(abbr), toCanonicalSpelling(abbr)]
        : [toCanonicalSpelling(abbr), toLiteralSpelling(abbr)];

    for (const key of keys) {
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

/**
 * 查表并取对应声调。不成词时返回 null，由调用方决定回退成什么。
 * 默认输出规范拼写：j/q/x/y 后的 ü 一律省两点（jv1 -> jū），
 * 这是《汉语拼音方案》的要求，字面拼写（jǖ）只在写了冒号时出现。
 * @param {string} abc
 * @param {string} num
 * @param {boolean} literal
 * @returns {string|null}
 */
function renderSyllable(abc, num, literal) {
    const syllables = lookupSyllables(abc, literal);
    if (!syllables) return null;
    return syllables[toneIndex(num)] ?? null;
}

/**
 * 把 ju:1 里的冒号还原成两点：找到音节里代表 ü 的那个字母，投影到词表的 v 键。
 *   ju:1   -> jü -> jv      juan:1 -> jüan -> jvan
 *   jv:1   -> jv            v 本来就是 ü 的 ASCII 写法，冒号只是把话说死
 *   nu:3   -> nü -> nv      u:1    -> ü    -> v
 *
 * u 和 v 都算「带两点的那个字母」：输入只能用美式键盘，v 是 ü 的常规替代写法，
 * 又明确写了冒号，说明这里确实要两点，把它当成 u: 的笔误即可，不必报错。
 *
 * 只允许 ü 真正能出现的声母（n/l/j/q/x/y 与零声母）。词表是按「声母 × 韵母」
 * 笛卡尔积生成的，里面还有 gv、shv 这类 217 个虚构键，不挡的话 gu:1 会输出
 * 一个不存在的 gǖ。零声母里只有单个 u / v 有意义（vai、uang 之类不是音节）。
 * 音节里没有 u / v（ji:1、ma:1）时同样返回 null，调用方原样返回。
 * @param {string} abc
 * @returns {string|null}
 */
function dottedKey(abc) {
    const i = abc.search(/[uv]/);
    if (i === -1) return null;

    const head = abc.slice(0, i);
    if (head === '') {
        if (abc !== 'u' && abc !== 'v') return null;
    } else if (!'nljqxy'.includes(head)) {
        return null;
    }

    // v 已经是词表里的写法，直接用；只有 u 需要换成 v
    return abc[i] === 'v' ? abc : abc.slice(0, i) + 'v' + abc.slice(i + 1);
}

/**
 * 冒号标记优先于默认拼写：写了 ju:1 / jv:1 就是要 jǖ，与上下文无关。
 * 冒号后面的字母属于同一音节（lu:e4 -> lüè），先拼回完整韵母再投影。
 * @param {string} abc
 * @param {string} mark
 * @param {string} after 冒号之后、声调数字之前的字母
 * @param {string} num
 * @param {boolean} literal
 * @returns {string|null}
 */
function renderToken(abc, mark, after, num, literal) {
    if (mark !== ':') return renderSyllable(abc, num, literal);

    const key = dottedKey(abc + after);
    return key ? renderSyllable(key, num, true) : null;
}

/**
 * 把一个 token 转成拼音。三种情况，其余一律原样返回：
 *
 *   1. 单个音节            ni3          -> nǐ
 *   2. 若干音节连写        ni3hao3      -> nǐhǎo
 *   3. 拼音 + ASCII 标点   ni3,hao3     -> nǐ,hǎo
 *
 * 输出保持输入的分隔方式：连写的音节之间不补空格，写了空格的地方空格还在，
 * 标点原样留在原位。转换只改字母和声调，不替调用方决定排版。
 *
 * 认不全就整串原样（"a1b2c3"、"hua1r"、"ma6"）：宁可少转一个 token，
 * 也不要输出半截结果 —— 半截结果比不转更难发现。
 * @param {string} str
 * @param {boolean} literal
 * @returns {string}
 */
function convertToken(str, literal) {
    const single = regex.exec(str);

    // 单音节快路径：绝大多数输入走这里
    if (single) {
        return renderToken(single.groups.abc, single.groups.mark, '', single.groups.num, literal) ?? str;
    }

    let out = '';
    let pos = 0;
    let count = 0;

    for (const part of str.matchAll(segment)) {
        const gap = str.slice(pos, part.index);
        if (foreign.test(gap)) return str;

        const { abc, mark, after, num } = part.groups;
        const piece = renderToken(abc, mark, after, num, literal);
        if (piece === null) return str;

        out += gap + piece;

        pos = part.index + part[0].length;
        count += 1;
    }

    const tail = str.slice(pos);
    if (count === 0 || foreign.test(tail)) return str;

    return out + tail;
}

/**
 * 按空格切分后逐 token 转换。literal 只在 toPinyinTonesVariants 内部使用，
 * 公开入口固定走规范拼写。
 * @param {string} longString
 * @param {boolean} literal
 * @returns {string}
 */
function convertTokens(longString, literal) {
    const stringArray = longString.trim().split(' ');

    return stringArray.map((str) => convertToken(str, literal)).join(' ');
}

/**
 * @param {string} longString
 * @return {string}
 */
function toPinyinTones(longString) {
    return convertTokens(longString, false);
}

/**
 * 混排文本里的候选片段：连续的字母 / 冒号 / 声调数字。
 * 前后必须是非 ASCII 字母数字下划线（中文、标点、空白都算边界）。
 * 没有边界的话，"abcju1" 这种英文单词内部会被切开当成拼音。
 *
 * 先按片段整体取出、再交给 convertToken，而不是逐音节匹配：
 * 这样 "ni3hao3" 在混排里也能切开，而 "ju1abc" 仍然整体不动。
 */
const inlineRun = /[a-z:0-5]+/g;
const wordChar = /[A-Za-z0-9_]/;

/**
 * 转换中文与拼音混排的整句：只替换其中的拼音片段，其余字符逐字保留。
 * 与 toPinyinTones 的区别是分词方式 —— 这里不按空格切，而是在整段里扫。
 *
 * 裸写（ju1 / jv1）输出规范拼写 jū；
 * 在 u 后面加一个英文冒号（ju:1）表示这个 u 带两点，输出 jǖ。
 * 冒号就是 ü 上面那两点，整段输入因此可以全部用美式键盘敲出。
 * @param {string} text
 * @returns {string}
 */
function toPinyinTonesInline(text) {
    return text.replace(inlineRun, (run, offset) => {
        const before = offset > 0 ? text[offset - 1] : '';
        const after = offset + run.length < text.length ? text[offset + run.length] : '';

        // 片段粘在字母数字上下划线旁边 -> 是英文单词的一部分，不动
        if (wordChar.test(before) || wordChar.test(after)) return run;

        // 不成词（单独的 j、英文单词）-> 原样保留
        return convertToken(run, false);
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
 * @returns {string}
 */
function convertUnspacedPinyin(unspacedSyllables){
    return toPinyinTones(splitUnspacedSyllables(unspacedSyllables)).split(' ').join('')
}

/**
 * 同时给出同一输入的规范形式与字面形式。
 * 只有 j/q/x/y 后的 ü 会不同，n/l 两边一样（nǚ / lǜ 在两种形式下都保留两点）。
 * 这是为了批量比对两种拼写，不是可选项 —— 单次转换一律给规范形式。
 * @param {string} longString
 * @returns {{ canonical: string, literal: string }}
 */
function toPinyinTonesVariants(longString) {
    return {
        canonical: convertTokens(longString, false),
        literal: convertTokens(longString, true),
    };
}

export default toPinyinTones;
export {splitUnspacedSyllables};
export {convertUnspacedPinyin};
export {toPinyinTonesVariants};
export {toPinyinTonesInline};
