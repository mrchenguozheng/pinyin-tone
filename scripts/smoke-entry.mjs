// 打包 → 装进一个干净工程 → 用 import 和 require 各取一次。
//
// 为什么不用测试框架：这一步要压在 package.json 的 engines 下界（>=14）上跑，而 mocha 与
// chai 的新版本在 Node 14 上装不上。这里只用 Node 内置模块，`npm pack` 之外不碰任何依赖。
//
// 为什么两侧都查：2.3.0 起这个包是纯 ESM，2.2.x 及以前是 CJS，两边都有调用方。
//   一、import 'pinyin-tone' 拿到的是函数本身（.default）。
//   二、require('pinyin-tone') 拿到的也是**函数本身**，不是 {default: fn} 这种包装 ——
//       老的 CJS 代码里处处是 `const toPinyinTones = require('pinyin-tone')`。
//   三、三个子路径（v1 / v2 / workaround）用 require 也能取到对应实现。
//
// 写成 .mjs 是因为要同时用 import()；require 用 createRequire 拿到。
// 不带 --pack-destination：npm 6（Node 14 时代的 npm）会把它当成安装路径报 ENOLOCAL。

import {execFileSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import path from 'node:path';
import process from 'node:process';

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

    const require = createRequire(path.join(work, 'noop.js'));

    // import 一侧走包名，由 exports 字段决定解析到哪个文件
    const imported = await import('pinyin-tone');
    const esm = imported.default;

    // require 一侧同样走包名
    const required = require('pinyin-tone');
    const requiredV1 = require('pinyin-tone/v1');
    const requiredV2 = require('pinyin-tone/v2');
    const requiredWorkaround = require('pinyin-tone/workaround');

    const cases = [
        ['import 根入口', esm('chu1 yin1 wei4 lai2'), 'chū yīn wèi lái'],
        ['import 根入口 .v2', imported.v2('liou2 yuen2'), 'lióu yuén'],
        ['import 根入口 .default 是函数本身', imported.default === esm, true],
        ['require 根入口是函数', typeof required, 'function'],
        ['require 根入口', required('chu1 yin1 wei4 lai2'), 'chū yīn wèi lái'],
        ['require 根入口 .v2', required.v2('liou2 yuen2'), 'lióu yuén'],
        ['require 根入口 .markSinglePinyinVowel', required.markSinglePinyinVowel('a1'), 'ā'],
        ['require 根入口 .default 指回自己', required.default === required, true],
        ['require v1 子路径', requiredV1('chu1 yin1 wei4 lai2'), 'chū yīn wèi lái'],
        ['require v2 子路径是函数', typeof requiredV2, 'function'],
        ['require v2 子路径', requiredV2('huar1 renr2 shuir3 yuer4'), 'huār rénr shuǐr yuèr'],
        ['require v2 子路径具名导出', requiredV2.convertUnspacedPinyin('han4yu3pin1yin1'), 'hànyǔpīnyīn'],
        ['require v2 子路径 .default 指回自己', requiredV2.default === requiredV2, true],
        ['require workaround 子路径', requiredWorkaround('toString'), 'toString'],
        ['require workaround 子路径 声调 1', requiredWorkaround('a1'), 'ā'],
        // 两个门是同一份实现，不是两份拷贝
        ['子路径与根导出是同一个对象', required.v2 === requiredV2, true],
        // 两侧对同一输入给出同一答案
        ['两侧一致', required('han4 yu3 pin1 yin1'), esm('han4 yu3 pin1 yin1')],
    ];

    let failed = 0;
    for (const [label, actual, expected] of cases) {
        if (actual !== expected) {
            failed += 1;
            console.error(`  ${label}：实际 ${JSON.stringify(actual)} != 期望 ${JSON.stringify(expected)}`);
        }
    }

    rmSync(path.join(repo, tarball), {force: true});

    if (failed > 0) {
        console.error(`smoke-entry: ${failed}/${cases.length} 条不符（node ${process.version}）`);
        process.exit(1);
    }
    console.log(`smoke-entry: ${cases.length} 条通过（node ${process.version}，ESM + CJS）`);
} finally {
    rmSync(work, {recursive: true, force: true});
}
