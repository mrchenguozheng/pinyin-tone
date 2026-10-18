// Wrap the three ESM modules under lib/ into one CommonJS implementation, written to
// dist/index.cjs.
//
// Why wrap mechanically instead of transpiling: lib/ has two imports and two exports, no
// import.meta, no dynamic import, and its syntax is ES2020, which Node 14 already reads. So
// the build only has to do two things — turn an import into "read the previous module's
// exports" and attach the exports to module.exports — and no build tool is needed, which
// means no artifact that drifts over time.
//
// Why not hand-write a CJS copy: that would be a second copy of the same logic, and changing
// one and forgetting the other is a certainty. Each build generates the file from the ESM
// source, and test/test-cjs.js pins it down by comparing it against the ESM entry.
//
// The output is built in memory and compared with the file already in dist/: if they match,
// nothing is touched. Both publishing and CI use the copy that git diff can see in the
// working tree.
//
// Usage: node scripts/build-cjs.mjs [--check]
//   --check compares without writing; it exits 1 when the two disagree (pretest and prepack
//   use this form).

import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import process from 'node:process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = join(ROOT, 'dist', 'index.cjs');
const checkOnly = process.argv.includes('--check');

const source = (file) => readFileSync(join(ROOT, 'lib', file), 'utf8');

// Indentation is injected line by line and empty lines stay empty — otherwise the diff fills
// up with noise that differs only in whitespace.
const indented = (text, depth) => text
    .split('\n')
    .map((line) => (line === '' ? '' : '    '.repeat(depth) + line))
    .join('\n');

/**
 * Wrap one ESM module's source in an immediately invoked function whose return value is the
 * result of evaluating that module once.
 *
 * The files do not find each other through require (the output is a single file, and there is
 * no dict.js in dist/ to require): an import becomes "read the previous entry of the wrapper
 * table", so the order must match ORDER below.
 *
 * Only the three shapes lib/ actually uses are handled (anything else trips the leftover
 * assertion below):
 *   import x from './y.js';        ->  const x = __modules[<position of y>]
 *   export default ...             ->  module.exports = ...
 *   export {a, b};                 ->  module.exports = {a, b};
 */
function wrap(file, code) {
    // Each module gets a module object up front: dict and core use `export default {...}`,
    // which after replacement is the bare object literal `module.exports = {`. Without this
    // declaration, `{` in statement position is read as a block, and the key/value pairs
    // inside become labelled statements (`sa: 'sā'` and friends are a syntax error).
    const body = code
        .replace(/^import (\w+) from '\.\/([\w.]+)';$/gm, (_, name, dep) => {
            const at = ORDER.indexOf(dep);
            if (at === -1 || at >= ORDER.indexOf(file)) {
                throw new Error(`${file}: dependency ${dep} is out of order (it must come first in ORDER)`);
            }
            return `const ${name} = __modules[${at}];`;
        })
        .replace(/^export default /m, 'module.exports = ')
        .replace(/^export \{([^}]*)\};$/m, (_, names) => `module.exports = {${names}};`);

    const leftover = body.match(/^\s*(import|export)\b.*$/m);
    if (leftover) {
        throw new Error(`${file}: ${leftover[0].trim()} was not handled — the wrapping rules need updating`);
    }

    return [
        '(function () {',
        indented(`let module = {exports: {}};\n${body.trimEnd()}`, 1),
        '    return module.exports;',
        '})()',
    ].join('\n');
}

// Order is evaluation order: dict and core depend on nothing, index depends on both.
const ORDER = ['dict.js', 'core.js', 'index.js'];
const modules = ORDER.map((file) => wrap(file, source(file)));

const output = [
    '// Generated file — do not edit. The source is in lib/; rebuild with `npm run build:cjs`.',
    '// scripts/build-cjs.mjs wraps lib/{dict,core,index}.js verbatim: the logic is the same as',
    '// the ESM build, with imports turned into references to the wrapped results and exports',
    '// attached to module.exports.',
    '',
    "'use strict';",
    '',
    // The three modules have to be evaluated in dependency order, but index reads
    // __modules[0] — as an array literal that would reference a constant before it is
    // initialised (TDZ). So the slots are prepared empty and filled one at a time.
    '// Each slot holds the result of evaluating that module once, in dependency order.',
    'const __modules = [];',
    '',
    modules.map((code, at) => `__modules[${at}] = ${code};\n`).join(''),
    // The public surface matches the ESM entry: one named export, no default export.
    // Adding default would allow both require() and import to pick the function up, which is
    // exactly what 3.0 removes.
    'module.exports = {markTones: __modules[2].markTones};',
    '',
].join('\n');

const current = existsSync(TARGET) ? readFileSync(TARGET, 'utf8') : null;

// --check runs from prepack, and prepack's output ends up in the stdout of `npm pack --json`,
// where it breaks JSON.parse downstream. So problems go to stderr and success says nothing;
// only an interactive run (without --check) prints progress for a human.
if (current === output) {
    if (!checkOnly) console.log('dist/index.cjs is up to date');
    process.exit(0);
}

if (checkOnly) {
    console.error('dist/index.cjs is out of sync with lib/; run `npm run build:cjs` to regenerate it');
    process.exit(1);
}

mkdirSync(dirname(TARGET), {recursive: true});
writeFileSync(TARGET, output);
console.log(`wrote dist/index.cjs (${output.split('\n').length} lines, ${(Buffer.byteLength(output) / 1024).toFixed(1)}KB)`);
