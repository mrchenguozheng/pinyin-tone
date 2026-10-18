// 打包 → 装进一个干净工程 → 在真实的 Node 上 import 一次。
//
// 为什么不用测试框架：这一步要压在 package.json 的 engines 下界（>=14）上跑，而 mocha 11
// 与 chai 6 在 Node 14 上装不上。这里只用 Node 内置模块，`npm pack` 之外不碰任何依赖。
//
// 为什么是 .mjs 而不是 .cjs：这个包是纯 ESM（"type": "module"），要验的就是 import 这一侧。
// 2.x 没有 CJS 入口，`require()` 在这里本来就不该通 —— 那是 3.0 才补上的。
//
// 为什么不带 --pack-destination：npm 6（Node 14 时代的 npm）会把它当成安装路径报 ENOLOCAL。

import {execFileSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {pathToFileURL} from 'node:url';

const repo = process.cwd();
const work = mkdtempSync(path.join(tmpdir(), 'smoke-entry-'));
// Windows 上 npm 是 .cmd，必须经 shell 才能 execFileSync。
// 经 shell 时参数里的空格会被重新拆开（"...\My Github\..." 变成两个参数），
// 所以凡是带空格的路径都自己加引号。
const shell = process.platform === 'win32';
const quote = (arg) => (shell && /\s/.test(arg) ? `"${arg}"` : arg);

function run(command, args, options = {}) {
    execFileSync(command, args.map(quote), {shell, stdio: 'inherit', ...options});
}

try {
    run('npm', ['pack']);

    const tarball = execFileSync('node', ['-p', 'require("./package.json").name + "-" + require("./package.json").version + ".tgz"'], {
        encoding: 'utf8',
    }).trim();

    writeFileSync(path.join(work, 'package.json'), JSON.stringify({name: 'smoke', version: '0.0.0', private: true, type: 'module'}));
    run('npm', ['install', path.join(repo, tarball), '--no-audit', '--no-fund'], {cwd: work});

    const {default: toPinyinTones, convertUnspacedPinyin} = await import(
        pathToFileURL(path.join(work, 'node_modules', 'pinyin-tone', 'v2', 'index.js')).href
    );

    const cases = [
        [toPinyinTones('chu1 yin1 wei4 lai2'), 'chū yīn wèi lái'],
        [toPinyinTones('huar1 renr2 shuir3 yuer4'), 'huār rénr shuǐr yuèr'],
        [convertUnspacedPinyin('han4yu3pin1yin1'), 'hànyǔpīnyīn'],
    ];

    let failed = 0;
    for (const [actual, expected] of cases) {
        if (actual !== expected) {
            failed += 1;
            console.error(`  实际 ${JSON.stringify(actual)} != 期望 ${JSON.stringify(expected)}`);
        }
    }

    rmSync(path.join(repo, tarball), {force: true});

    if (failed > 0) {
        console.error(`smoke-entry: ${failed}/${cases.length} 条不符（node ${process.version}）`);
        process.exit(1);
    }
    console.log(`smoke-entry: ${cases.length} 条通过（node ${process.version}）`);
} finally {
    rmSync(work, {recursive: true, force: true});
}
