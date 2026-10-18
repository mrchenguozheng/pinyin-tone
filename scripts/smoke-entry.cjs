// Smoke test for the engines floor: pack the package for real, install it into a clean
// project, and resolve both the import and the require condition the way a user would.
//
// Why not just require('./dist/index.cjs') in the repository: that only proves the file has
// valid syntax. What is being checked here is that the package works once a user has it the
// way npm delivers it — which involves the conditional selection in the exports field, whether
// the files whitelist missed something, and whether package.json's type makes .cjs be
// misread. Get any of those three wrong and every test in the repository still passes.
//
// Why the probe files are .cjs: Node 14's ESM loader only loads packages in CJS form (and
// real users reach it through require), while type: module in the repository root would make a
// bare .js be read as ESM. .cjs is the only extension that means the same thing on 14 and 22.
//
// Usage: node scripts/smoke-entry.cjs
//   Exit code 0 means both loading styles reach markTones and produce the right output.

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
    // On Windows npm is a .cmd, which execFileSync can only reach through a shell
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
});

const problems = [];

try {
    // 1. Pack into a temporary directory (prepack first checks that dist/index.cjs matches lib/)
    //
    // The old form without `--pack-destination` is deliberate: npm 6, which ships with Node 14,
    // reads that flag as "the path to install", reporting ENOLOCAL: ... does not contain a
    // package.json. So the tgz is produced in the repository root and moved into the temporary
    // directory here — a form both npm generations understand.
    run('npm', ['pack'], ROOT);
    const tarball = readdirSync(ROOT).filter((name) => name.endsWith('.tgz')).sort().pop();
    if (!tarball) {
        throw new Error('npm pack did not produce a tgz in the repository root');
    }
    renameSync(join(ROOT, tarball), join(WORK, tarball));

    // 2. A clean project (no type: module, so .js is read as CJS — the hardest case for the
    //    require condition)
    writeFileSync(join(WORK, 'package.json'), JSON.stringify({name: 'smoke', private: true}, null, 2));
    // An absolute path: the old npm (6.x, shipped with Node 14) reads './x.tgz' as a path
    // relative to a source directory and cannot find it in a temporary directory. With an
    // absolute path both npm generations resolve it the same way.
    run('npm', ['install', '--no-audit', '--no-fund', join(WORK, tarball)], WORK);

    // 3. The require condition: CJS usage
    const cjsProbe = [
        "const {markTones} = require('pinyin-tone');",
        `const got = markTones('${SAMPLE}');`,
        `if (got !== '${EXPECTED}') throw new Error('require branch returned the wrong output: ' + JSON.stringify(got));`,
        "if (typeof require('pinyin-tone').default !== 'undefined') throw new Error('the module require() returns must not have a default export');",
    ].join('\n');
    writeFileSync(join(WORK, 'probe.cjs'), cjsProbe);
    run(process.execPath, ['probe.cjs'], WORK);

    // 4. The import condition: ESM usage. The .mjs extension makes it ESM on any Node version
    const esmProbe = [
        "import {markTones} from 'pinyin-tone';",
        `const got = markTones('${SAMPLE}');`,
        `if (got !== '${EXPECTED}') throw new Error('import branch returned the wrong output: ' + JSON.stringify(got));`,
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
    console.error(`Smoke test failed on Node ${process.version}:`);
    for (const problem of problems) console.error('  - ' + problem.replace(/\n/g, '\n    '));
    process.exit(1);
}

console.log(`Node ${process.version}: require and import both reach markTones and return ${EXPECTED}`);
