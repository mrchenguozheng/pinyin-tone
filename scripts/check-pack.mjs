// Guard the npm package contents: run `npm pack --dry-run` and check the file list and sizes.
//
// Background: CONTRIBUTORS.svg embeds two base64 avatars (242KB + 90KB, displayed at 64x64),
// and the 455KB image took up three quarters of the tarball. A size problem does not turn any
// test red, so it needs an assertion that looks at the package itself.
//
// Node built-ins only, no dependencies — this script has to run right after `npm ci`.

import {execFileSync} from 'node:child_process';
import process from 'node:process';

// Paths that must not appear in the package (prefix match), and why
const FORBIDDEN = [
    ['CONTRIBUTORS.svg', 'the contributor image is for the README only, 455KB, not shipped'],
    ['test/', 'tests are not shipped'],
    ['scripts/', 'the guard scripts themselves are not shipped'],
    ['.travis.yml', 'obsolete CI config'],
    ['tsconfig.json', 'type-checking config, never read at run time'],
    ['CHANGELOG.md', 'the changelog lives on GitHub — 22KB, close to a quarter of the tarball'],
    // The only prose file shipped is README.md at the repository root. The Chinese version
    // lives under docs/ for exactly this reason: npm unconditionally includes every `README*`
    // in the repository root, with priority over files and .npmignore (measured — `README.zh.md`
    // ends up in the package however it is excluded), so the Chinese version can neither be
    // named `README.*` nor sit at the root.
    ['docs/', 'the detail pages live in the repository only, in both languages; the Chinese README is here too'],
    ['v1/', 'the v1 implementation was removed in 3.0'],
    ['legacy/', 'the v1 implementation was removed in 3.0'],
    ['v2/', 'the directory was renamed lib/; the old name must not come back'],
    ['workaround/', 'the single-letter subpath was removed in 3.0 and is covered by markTones'],
];

// Files that must be in the package: a missing one means the files whitelist is incomplete
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

// Limits leave headroom above the measured values (tarball about 52KB, largest file
// dist/index.cjs about 77KB). Hitting one means something was packed by mistake, or the
// dictionary really grew — both are worth a look.
const MAX_TARBALL = 96 * 1024;
const MAX_FILE = 96 * 1024;

const raw = execFileSync('npm', ['pack', '--json', '--dry-run'], {
    encoding: 'utf8',
    // On Windows npm is a .cmd, which execFileSync can only reach through a shell
    shell: process.platform === 'win32',
});

const [info] = JSON.parse(raw);
const problems = [];

for (const [path, reason] of FORBIDDEN) {
    const hit = info.files.find((f) => f.path === path || f.path.startsWith(path));
    if (hit) problems.push(`should not be packed: ${hit.path} (${reason})`);
}

for (const path of REQUIRED) {
    if (!info.files.some((f) => f.path === path)) problems.push(`missing file: ${path}`);
}

if (info.size > MAX_TARBALL) {
    problems.push(`tarball is ${(info.size / 1024).toFixed(0)}KB, over the ${MAX_TARBALL / 1024}KB limit`);
}

for (const file of info.files) {
    if (file.size > MAX_FILE) {
        problems.push(`file too large: ${file.path} ${(file.size / 1024).toFixed(0)}KB, over ${MAX_FILE / 1024}KB`);
    }
}

console.log(`${info.files.length} files, tarball ${(info.size / 1024).toFixed(1)}KB, unpacked ${(info.unpackedSize / 1024).toFixed(1)}KB`);
for (const file of [...info.files].sort((a, b) => b.size - a.size).slice(0, 5)) {
    console.log(`  ${(file.size / 1024).toFixed(1).padStart(6)}KB  ${file.path}`);
}

if (problems.length > 0) {
    console.error('\nPackage contents are not what was expected:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
}

console.log('package contents OK');
