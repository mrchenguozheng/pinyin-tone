// engines 下限冒烟：把包真的打出来、装进一个干净工程，再用真实的方式解析
// import 与 require 两个条件。
//
// 为什么不在仓库里直接 require('./dist/index.cjs')：那验的是「文件语法没问题」，
// 而这里要验的是「用户按 npm 的方式拿到包之后能用」—— 区别在于 exports 字段的
// 条件选择、files 白名单有没有漏文件、package.json 的 type 会不会让 .cjs 被误判。
// 这三件事里任何一件错了，仓库内的测试都照样全绿。
//
// 为什么探针文件用 .cjs：Node 14 的 ESM 加载器只会加载 CJS 形式的包（真实用户
// 就认得 require），而仓库根 package.json 的 type: module 会让不带后缀的 .js 按
// ESM 解释。.cjs 是唯一在 14 与 22 上含义相同的写法。
//
// 用法：node scripts/smoke-entry.cjs
//   退出码 0 = 两种加载方式都能拿到 markTones 且输出正确。

const {execFileSync} = require('node:child_process');
const {mkdtempSync, writeFileSync, rmSync, readdirSync, renameSync} = require('node:fs');
const {join} = require('node:path');
const {tmpdir} = require('node:os');

const ROOT = join(__dirname, '..');
const WORK = mkdtempSync(join(tmpdir(), 'pinyin-tone-smoke-'));

const EXPECTED = 'nǐ hǎo';
const SAMPLE = 'ni3 hao3';

const run = (cmd, args, cwd) => execFileSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    // Windows 上 npm 是 .cmd，必须经 shell 才能 execFileSync
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
});

const problems = [];

try {
    // 1. 打包到临时目录（prepack 会先校验 dist/index.cjs 与 lib/ 是否同步）
    //
    // 这里故意用 `--pack-destination` 之外的老写法：Node 14 自带的 npm 6 会把
    // 这个参数当成「要安装的路径」（报 ENOLOCAL: ... does not contain a package.json），
    // 所以只在仓库根目录产出 tgz，再自己搬进临时目录 —— 两代 npm 都认的写法。
    run('npm', ['pack'], ROOT);
    const tarball = readdirSync(ROOT).filter((name) => name.endsWith('.tgz')).sort().pop();
    if (!tarball) {
        throw new Error('npm pack 没有在仓库根目录产出 tgz');
    }
    renameSync(join(ROOT, tarball), join(WORK, tarball));

    // 2. 干净工程（不带 type: module，于是 .js 按 CJS 解释 —— 这是最考验 require 条件的情形）
    writeFileSync(join(WORK, 'package.json'), JSON.stringify({name: 'smoke', private: true}, null, 2));
    // 用绝对路径：老 npm（Node 14 自带的 6.x）会把 './x.tgz' 当成相对**源目录**的路径，
    // 于是在临时目录里找不到 —— 换成绝对路径，两代 npm 的解析结果就一致了。
    run('npm', ['install', '--no-audit', '--no-fund', join(WORK, tarball)], WORK);

    // 3. require 条件：CJS 用法
    const cjsProbe = [
        "const {markTones} = require('pinyin-tone');",
        `const got = markTones('${SAMPLE}');`,
        `if (got !== '${EXPECTED}') throw new Error('require 分支输出不对: ' + JSON.stringify(got));`,
        "if (typeof require('pinyin-tone').default !== 'undefined') throw new Error('require 回来的模块不该有 default');",
    ].join('\n');
    writeFileSync(join(WORK, 'probe.cjs'), cjsProbe);
    run(process.execPath, ['probe.cjs'], WORK);

    // 4. import 条件：ESM 用法。.mjs 后缀让它在任何 Node 版本上都按 ESM 解释
    const esmProbe = [
        "import {markTones} from 'pinyin-tone';",
        `const got = markTones('${SAMPLE}');`,
        `if (got !== '${EXPECTED}') throw new Error('import 分支输出不对: ' + JSON.stringify(got));`,
    ].join('\n');
    writeFileSync(join(WORK, 'probe.mjs'), esmProbe);
    run(process.execPath, ['probe.mjs'], WORK);
} catch (error) {
    const detail = error.stderr && error.stderr.trim() ? error.stderr.trim() : error.message;
    problems.push(detail);
} finally {
    rmSync(WORK, {recursive: true, force: true});
}

if (problems.length > 0) {
    console.error(`Node ${process.version} 上冒烟失败：`);
    for (const problem of problems) console.error('  - ' + problem.replace(/\n/g, '\n    '));
    process.exit(1);
}

console.log(`Node ${process.version}: require 与 import 都能拿到 markTones，输出 ${EXPECTED}`);
