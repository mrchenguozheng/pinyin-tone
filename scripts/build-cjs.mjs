// 把 lib/ 里的三个 ESM 模块机械地包成一份 CommonJS 实现，写到 dist/index.cjs。
//
// 为什么是「机械包裹」而不是转译：lib/ 里只有两条 import 和两条 export，
// 没有 import.meta、没有动态 import，语法也是 Node 14 就认识的 ES2020。
// 于是打包只需要两件事 —— 把 import 换成「读前一个模块的导出」、把导出挂到
// module.exports 上 —— 不必引入构建工具，也就不必引入一个会随时间漂移的产物。
//
// 为什么不手写一份 CJS：那是同一份逻辑的第二个副本，改一处忘一处是必然的事。
// 这里每次构建都从 ESM 源现生成，并用 test/test-cjs.js 与 ESM 逐条对拍把它钉住。
//
// 产物先进内存，再与 dist/ 里已有的文件比对：一致就一动不动，发布用和 CI 用的
// 都是工作区里能被 git diff 看见的那一份。
//
// 用法：node scripts/build-cjs.mjs [--check]
//   --check 只比对、不写入；不一致时以退出码 1 失败（pretest 与 prepack 用这个）。

import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import process from 'node:process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = join(ROOT, 'dist', 'index.cjs');
const checkOnly = process.argv.includes('--check');

const source = (file) => readFileSync(join(ROOT, 'lib', file), 'utf8');

// 缩进要按「行」注入，空行保持空行 —— 否则 diff 里全是只差空格的噪音
const indented = (text, depth) => text
    .split('\n')
    .map((line) => (line === '' ? '' : '    '.repeat(depth) + line))
    .join('\n');

/**
 * 把一段 ESM 模块源码包成一个自执行函数，函数的返回值就是一次模块求值的结果。
 *
 * 文件之间不通过 require 互相查找（产物是单文件，dist/ 里没有 dict.js 可查）：
 * import 被换成「读包裹表里的前一项」，顺序因此必须与下面的 ORDER 一致。
 *
 * 只认 lib/ 里实际用到的三种形态（多一种都会由下面的 leftover 断言抛出）：
 *   import x from './y.js';        ->  const x = __modules[<y 的位置>]
 *   export default ...             ->  module.exports = ...
 *   export {a, b};                 ->  module.exports = {a, b};
 */
function wrap(file, code) {
    // 每个模块内部先备一个 module 对象：dict 与 core 用的是 `export default {...}`，
    // 替换后成了 `module.exports = {` 这个裸对象字面量。若没有这句声明，`{` 在语句
    // 位置会被当成块语句，里面的键值对就成了标签语句（`sa: 'sā'` 之类直接语法错）。
    const body = code
        .replace(/^import (\w+) from '\.\/([\w.]+)';$/gm, (_, name, dep) => {
            const at = ORDER.indexOf(dep);
            if (at === -1 || at >= ORDER.indexOf(file)) {
                throw new Error(`${file}: 依赖 ${dep} 的顺序不对（ORDER 里必须排在它前面）`);
            }
            return `const ${name} = __modules[${at}];`;
        })
        .replace(/^export default /m, 'module.exports = ')
        .replace(/^export \{([^}]*)\};$/m, (_, names) => `module.exports = {${names}};`);

    const leftover = body.match(/^\s*(import|export)\b.*$/m);
    if (leftover) {
        throw new Error(`${file}: 还有没被处理的 ${leftover[0].trim()} —— 包裹规则要跟着改`);
    }

    return [
        '(function () {',
        indented(`let module = {exports: {}};\n${body.trimEnd()}`, 1),
        '    return module.exports;',
        '})()',
    ].join('\n');
}

// 顺序即求值顺序：dict 与 core 不依赖别人，index 依赖前两者
const ORDER = ['dict.js', 'core.js', 'index.js'];
const modules = ORDER.map((file) => wrap(file, source(file)));

const output = [
    '// 构建产物，不要直接改 —— 源在 lib/，用 `npm run build:cjs` 重新生成。',
    '// 由 scripts/build-cjs.mjs 从 lib/{dict,core,index}.js 逐字包裹而来：',
    '// 逻辑与 ESM 版本同源，只把 import 换成对包裹结果的引用、把 export 挂到 module.exports。',
    '',
    "'use strict';",
    '',
    // 三个模块必须按依赖顺序求值，但 index 里要读 __modules[0] —— 直接写成数组字面量
    // 会在半途引用尚未初始化的常量（TDZ）。所以先准备好空槽，再逐个赋值。
    '// 每个槽位是那个模块一次求值的结果，顺序与 lib/ 里的依赖顺序一致',
    'const __modules = [];',
    '',
    modules.map((code, at) => `__modules[${at}] = ${code};\n`).join(''),
    // 公开面与 ESM 入口一致：一个具名导出，没有默认导出。
    // 加 default 会让 require() 与 import 两种取法并存，正是 3.0 要去掉的东西。
    'module.exports = {markTones: __modules[2].markTones};',
    '',
].join('\n');

const current = existsSync(TARGET) ? readFileSync(TARGET, 'utf8') : null;

// --check 被 prepack 调用，而 prepack 的输出会混进 `npm pack --json` 的 stdout，
// 让下游 JSON.parse 直接炸。所以只在真的要报告问题时写 stderr，成功时不出声；
// 交互执行（不加 --check）才打印人看的进度。
if (current === output) {
    if (!checkOnly) console.log('dist/index.cjs 已是最新');
    process.exit(0);
}

if (checkOnly) {
    console.error('dist/index.cjs 与 lib/ 不同步，运行 `npm run build:cjs` 重新生成');
    process.exit(1);
}

mkdirSync(dirname(TARGET), {recursive: true});
writeFileSync(TARGET, output);
console.log(`写入 dist/index.cjs（${output.split('\n').length} 行，${(Buffer.byteLength(output) / 1024).toFixed(1)}KB）`);
