// npm 包内容守卫：跑 `npm pack --dry-run`，检查文件清单与体积。
//
// 起因：CONTRIBUTORS.svg 里内嵌了两张 base64 头像（242KB + 90KB，显示尺寸
// 只有 64×64），455KB 的图占了 tarball 四分之三。体积问题不会让任何测试变红，
// 只能靠一条专门盯着包的断言来挡。
//
// 只用 Node 内置模块，不引依赖 —— 这个脚本要能在 `npm ci` 之后立刻跑。

import {execFileSync} from 'node:child_process';
import process from 'node:process';

// 不允许出现在包里的路径（前缀匹配）及原因
const FORBIDDEN = [
    ['CONTRIBUTORS.svg', '贡献者图只给 README 看，455KB，不进包'],
    ['test/', '测试不进包'],
    ['scripts/', '守卫脚本自身不进包'],
    ['.travis.yml', '已废弃的 CI 配置'],
    ['tsconfig.json', '类型检查配置，运行时不读'],
    ['CHANGELOG.md', '更新日志只在 GitHub 上看 —— 22KB，占 tarball 近四分之一'],
    ['v1/', 'v1 实现已在 3.0 删除'],
    ['legacy/', 'v1 实现已在 3.0 删除'],
    ['v2/', '目录已改名 lib/，旧名字不应回来'],
    ['workaround/', '单字母查表子路径已在 3.0 删除，被 markTones 覆盖'],
];

// 包里必须有的文件：少一个就说明 files 白名单写漏了
const REQUIRED = [
    'lib/index.js',
    'lib/core.js',
    'lib/dict.js',
    'lib/index.d.ts',
    'dist/index.cjs',
    'README.md',
    'LICENSE',
    'package.json',
];

// 上限按当前实测值留出余量（实测 tarball 约 57KB、单文件最大 dist/index.cjs 约 74KB）。
// 触顶说明有东西被误打包，或词表真的长大了 —— 两种都该有人看一眼。
const MAX_TARBALL = 96 * 1024;
const MAX_FILE = 96 * 1024;

const raw = execFileSync('npm', ['pack', '--json', '--dry-run'], {
    encoding: 'utf8',
    // Windows 上 npm 是 .cmd，必须经 shell 才能 execFileSync
    shell: process.platform === 'win32',
});

const [info] = JSON.parse(raw);
const problems = [];

for (const [path, reason] of FORBIDDEN) {
    const hit = info.files.find((f) => f.path === path || f.path.startsWith(path));
    if (hit) problems.push(`不该进包：${hit.path}（${reason}）`);
}

for (const path of REQUIRED) {
    if (!info.files.some((f) => f.path === path)) problems.push(`缺少文件：${path}`);
}

if (info.size > MAX_TARBALL) {
    problems.push(`tarball ${(info.size / 1024).toFixed(0)}KB 超过上限 ${MAX_TARBALL / 1024}KB`);
}

for (const file of info.files) {
    if (file.size > MAX_FILE) {
        problems.push(`单文件过大：${file.path} ${(file.size / 1024).toFixed(0)}KB 超过 ${MAX_FILE / 1024}KB`);
    }
}

console.log(`${info.files.length} 个文件，tarball ${(info.size / 1024).toFixed(1)}KB，解包 ${(info.unpackedSize / 1024).toFixed(1)}KB`);
for (const file of [...info.files].sort((a, b) => b.size - a.size).slice(0, 5)) {
    console.log(`  ${(file.size / 1024).toFixed(1).padStart(6)}KB  ${file.path}`);
}

if (problems.length > 0) {
    console.error('\n包内容不符合预期：');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
}

console.log('包内容 OK');
