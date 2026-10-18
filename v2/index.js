'use strict';
import pinyin_dict_v2 from './dict.js';
import coreSyllables from './core.js';

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
 * 这个词表键在严格模式下认不认。
 *
 * 词表为了宽容收了 1953 个键，其中 1110 条是「声母 × 韵母」笛卡尔积的产物
 * （jui、juang、juei、biong），严格模式只认普通话的 425 个音节。
 * 儿化不单独列：huar 的合法性完全由 hua 决定，去掉尾字母 r 再查一次即可，
 * 418 条儿化音节因此一条都不用写进 core.js。
 * @param {string} key
 * @returns {boolean}
 */
function isCoreSyllable(key) {
    if (coreSyllables.has(key)) return true;

    // 字面拼写（jv / jve / jvan / jvn）与规范拼写是同一音位，core 只收规范那条。
    // 投影后再判儿化，jver 才能按 juer -> jue + r 走通。
    const canonical = toCanonicalSpelling(key);
    if (coreSyllables.has(canonical)) return true;

    return canonical.length > 1 && canonical.endsWith('r')
        && coreSyllables.has(canonical.slice(0, -1));
}

/**
 * 查表取某个音节的**无调形式**。先按请求的拼写查，查不到再用另一种拼写兜底：
 * j/q/x/y 后的 ü 在词表里两种键都有，投影是安全的；兜底则是为了将来
 * 清掉冗余的 jv 键时不至于让字面形式直接失效。
 *
 * strict 时，两种拼写都要过 core 白名单才能查 —— 否则 jv1 走兜底绕过严格模式。
 * @param {string} abbr
 * @param {boolean} literal true 取字面拼写（jü），false 取规范拼写（ju）
 * @param {boolean} strict 只认普通话的 425 个音节
 * @returns {string|undefined}
 */
function lookupBase(abbr, literal, strict) {
    const keys = literal
        ? [toLiteralSpelling(abbr), toCanonicalSpelling(abbr)]
        : [toCanonicalSpelling(abbr), toLiteralSpelling(abbr)];

    for (const key of keys) {
        if (strict && !isCoreSyllable(key)) continue;

        const base = pinyin_dict_v2[key];
        if (base !== undefined) return base;
    }
    return undefined;
}

/**
 * 空 / 0 / 5 都表示轻声，对应不加调号
 * @param {string} num
 * @returns {number}
 */
function toneIndex(num) {
    return num === '' || num === '0' || num === '5' ? 0 : Number(num);
}

// 一声到四声的调号。轻声不加，所以从 1 开始用。
// m / n 两行只给没有元音的叹词音节兜底用 —— 它们标在鼻音本身（ḿ、hńg）。
// 用数组而不是字符串做索引：m̄ / m̌ / m̀ / n̄ 是「字母 + 组合符」两个码位，
// 按字符串下标取会取到半个字符。
const TONE_MARKS = {
    a: ['ā', 'á', 'ǎ', 'à'],
    o: ['ō', 'ó', 'ǒ', 'ò'],
    e: ['ē', 'é', 'ě', 'è'],
    i: ['ī', 'í', 'ǐ', 'ì'],
    u: ['ū', 'ú', 'ǔ', 'ù'],
    'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    m: ['m\u0304', 'ḿ', 'm\u030c', 'm\u0300'],
    n: ['n\u0304', 'ń', 'ň', 'ǹ'],
};

// 除 a/o/e 之外的元音。iu 标 u、ui 标 i 由「取最后一个」自动满足。
const CLOSING_VOWELS = 'iuü';

// 叹词音节的落调位置：倒数第一个 m 或 n（m -> ḿ、hng -> hńg、ng -> ńg）。
const NASALS = 'mn';

// 叹词音节里，词典（pypinyin 的 pinyin_dict，注音取自《现代汉语词典》一系）
// 真实出现过的组合。字形逐条抄自该表：
//   m   m̄ 嘸 / ḿ 呒呣唔嘸 / m̀ 呣      —— 没有第三声
//   n   ń 咹哽唔嗯 / ň 㕶嗯 / ǹ 哏嗯   —— 没有第一声
//   ng  ńg 哽唔嗯 / ňg 㕶嗯 / ǹg 嗯   —— 没有第一声
//   hm  噷                            —— 只有无调
//   hng 哼                            —— 只有无调
//
// 这张表是**优先表**，不是闭集：查得到就用这里的字形，查不到按「标在最后一个
// 鼻音上」的规则生成。所以 m3、n1、ng1 以及 hm / hng 的四声照样能转换 ——
// `m3` 得到 `m̌`、`hng2` 得到 `hńg`。这 11 个形式是外推，词典里没有；
// 它们和上面 9 个有依据的形式走同一个出口，输出上不作区分。
//
// 表里这 9 个值目前与规则算出来的结果逐条相同（所以删掉整张表，测试也不会红）。
// 留着它是为了让「有依据的那几格」不随规则一起漂：将来若改落调位置或改码位写法，
// 这 9 个字形仍按词典的写法输出，而不是被规则顺手改写。
// m̄ / m̀ 是「字母 + 组合符」两个码位，写在这里比在别处拼接更不容易出错。
const NASAL_TONES = {
    m: {1: 'm\u0304', 2: 'ḿ', 4: 'm\u0300'},
    n: {2: 'ń', 3: 'ň', 4: 'ǹ'},
    ng: {2: 'ńg', 3: 'ňg', 4: 'ǹg'},
    hm: {},
    hng: {},
};

/**
 * 给无调音节加声调符号：有 a 标 a，无 a 有 o 标 o，无 a/o 有 e 标 e，
 * 否则标最后一个元音（iu -> u、ui -> i）。儿化尾 r 不是元音，不影响判断。
 *
 * 一个元音都没有的音节（m、n、ng、hm、hng）先查 NASAL_TONES：词典里收过这个
 * 声调就用表里的字形；没收录的按同一规则生成 —— 标在倒数第一个 m 或 n 上
 * （m3 -> m̌、hng2 -> hńg）。查表在前是为了让 m̄ / m̀ 这类「字母 + 组合符」的
 * 码位固定下来，规则算出来的结果与之一致。
 *
 * 词表只存无调形式，四个声调在这里生成 —— 它们是同一条规则的展开，
 * 存 4 条预生成字符串和存 1 条再算，结果逐条相同（全表 1949 × 5 已验证）。
 * 轻声（tone 0）不加调。
 * @param {string} base
 * @param {number} tone 0-4
 * @returns {string|null} null 表示这个音节加不上调（不是已知的叹词音节）
 */
function markTone(base, tone) {
    if (tone === 0) return base;

    let at = -1;
    for (const vowel of 'aoe') {
        at = base.indexOf(vowel);
        if (at !== -1) break;
    }

    if (at === -1) {
        for (let i = base.length - 1; i >= 0; i -= 1) {
            if (CLOSING_VOWELS.includes(base[i])) {
                at = i;
                break;
            }
        }
    }

    if (at === -1) {
        const closed = NASAL_TONES[base];
        if (closed && closed[tone]) return closed[tone];

        for (let i = base.length - 1; i >= 0; i -= 1) {
            if (NASALS.includes(base[i])) {
                const nasalMarks = TONE_MARKS[base[i]];
                return nasalMarks
                    ? base.slice(0, i) + nasalMarks[tone - 1] + base.slice(i + 1)
                    : null;
            }
        }
        return null;
    }

    const marks = TONE_MARKS[base[at]];
    return marks ? base.slice(0, at) + marks[tone - 1] + base.slice(at + 1) : base;
}

/**
 * 查表取无调形式，再加声调。不成词时返回 null，由调用方决定回退成什么。
 * 默认输出规范拼写：j/q/x/y 后的 ü 一律省两点（jv1 -> jū），
 * 这是《汉语拼音方案》的要求，字面拼写（jǖ）只在写了冒号时出现。
 * @param {string} abc
 * @param {string} num
 * @param {boolean} literal
 * @param {boolean} strict
 * @returns {string|null}
 */
function renderSyllable(abc, num, literal, strict) {
    const base = lookupBase(abc, literal, strict);
    if (base === undefined) return null;
    return markTone(base, toneIndex(num));
}

/**
 * 把冒号所在的字母还原成 ü：u -> v（词表用 v 表示 ü）。
 *   ju:1   -> jv      juan:1 -> jvan      nu:3 -> nv
 *   gu:1   -> gv      u:1    -> v         u:e1 -> ve
 *
 * 冒号应当写在 u 上 —— u 就是那个要带两点的字母。`jv:` 里的 v 已经是 ü 的
 * ASCII 写法，再写冒号是把同一件事说了两遍，但意思并没有歧义，所以照 `ju:`
 * 处理，不当错误：jv:1 与 ju:1 同义，都是 jǖ。
 *
 * 不按声母筛：冒号是用户明确写下的，写在哪里就是要哪里的 ü。`gu:1` 得到 `gǖ`、
 * `u:e1` 得到 `üē` 这类不合规范的音节，正是这个包存在的理由之一 —— 它既要输出
 * 规范拼写，也要输出不规范的拼写。要不要用由调用方决定，转换器不替它判断。
 *
 * 音节里没有 u / v 时无处可落（ma:1、ji:1），返回 null，调用方原样返回。
 * @param {string} abc
 * @returns {string|null}
 */
function dottedKey(abc) {
    const i = abc.search(/[uv]/);
    if (i === -1) return null;

    // v 已经是词表里的写法，直接用；只有 u 需要换成 v
    return abc[i] === 'v' ? abc : abc.slice(0, i) + 'v' + abc.slice(i + 1);
}

/**
 * 冒号标记优先于默认拼写：写了 ju:1 就是要 jǖ，与上下文无关
 * （jv:1 同义，v 就是 ü 的 ASCII 写法）。
 * 冒号后面的字母属于同一音节（lu:e4 -> lüè），先拼回完整韵母再投影。
 * @param {string} abc
 * @param {string} mark
 * @param {string} after 冒号之后、声调数字之前的字母
 * @param {string} num
 * @param {boolean} literal
 * @param {boolean} strict
 * @returns {string|null}
 */
function renderToken(abc, mark, after, num, literal, strict) {
    if (mark !== ':') return renderSyllable(abc, num, literal, strict);

    const key = dottedKey(abc + after);
    if (key === null) return null;

    const syllable = renderSyllable(key, num, true, strict);

    // 词表这一格没把 v 当 ü 时，输出里会留着辅音字母 v（vai -> vāi、vv -> vü）。
    // 冒号要的是 ü，给不出 ü 就当落不了点，原样返回。
    if (syllable === null || syllable.includes('v')) return null;

    return syllable;
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
 * @param {boolean} strict
 * @returns {string}
 */
function convertToken(str, literal, strict) {
    const single = regex.exec(str);

    // 单音节快路径：绝大多数输入走这里
    if (single) {
        return renderToken(single.groups.abc, single.groups.mark, '', single.groups.num, literal, strict) ?? str;
    }

    let out = '';
    let pos = 0;
    let count = 0;

    for (const part of str.matchAll(segment)) {
        const gap = str.slice(pos, part.index);
        if (foreign.test(gap)) return str;

        const { abc, mark, after, num } = part.groups;
        const piece = renderToken(abc, mark, after, num, literal, strict);
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
 * @param {boolean} strict
 * @returns {string}
 */
function convertTokens(longString, literal, strict) {
    const stringArray = longString.trim().split(' ');

    return stringArray.map((str) => convertToken(str, literal, strict)).join(' ');
}

/**
 * 公开入口的选项只认 strict 一个字段，其余一律忽略 —— 传了错的东西不该换算法。
 * @param {{strict?: boolean}|undefined} options
 * @returns {boolean}
 */
function readStrict(options) {
    return Boolean(options && options.strict);
}

/**
 * @param {string} longString
 * @param {{strict?: boolean}} [options]
 * @return {string}
 */
function toPinyinTones(longString, options) {
    return convertTokens(longString, false, readStrict(options));
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
 * @param {{strict?: boolean}} [options]
 * @returns {string}
 */
function toPinyinTonesInline(text, options) {
    const strict = readStrict(options);

    return text.replace(inlineRun, (run, offset) => {
        const before = offset > 0 ? text[offset - 1] : '';
        const after = offset + run.length < text.length ? text[offset + run.length] : '';

        // 片段粘在字母数字上下划线旁边 -> 是英文单词的一部分，不动
        if (wordChar.test(before) || wordChar.test(after)) return run;

        // 不成词（单独的 j、英文单词）-> 原样保留
        return convertToken(run, false, strict);
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
 * @param {{strict?: boolean}} [options]
 * @returns {string}
 */
function convertUnspacedPinyin(unspacedSyllables, options){
    return toPinyinTones(splitUnspacedSyllables(unspacedSyllables), options).split(' ').join('')
}

/**
 * 同时给出同一输入的规范形式与字面形式。
 * 只有 j/q/x/y 后的 ü 会不同，n/l 两边一样（nǚ / lǜ 在两种形式下都保留两点）。
 * 这是为了批量比对两种拼写，不是可选项 —— 单次转换一律给规范形式。
 * @param {string} longString
 * @param {{strict?: boolean}} [options]
 * @returns {{ canonical: string, literal: string }}
 */
function toPinyinTonesVariants(longString, options) {
    const strict = readStrict(options);

    return {
        canonical: convertTokens(longString, false, strict),
        literal: convertTokens(longString, true, strict),
    };
}

export default toPinyinTones;
export {splitUnspacedSyllables};
export {convertUnspacedPinyin};
export {toPinyinTonesVariants};
export {toPinyinTonesInline};
