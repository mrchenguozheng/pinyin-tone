// Wrap the ESM sources — index.js, v1/, v2/, workaround/ — into one CommonJS file,
// dist/index.cjs, so that `require('pinyin-tone')` and `import … from 'pinyin-tone'` both
// work. 2.x is ESM only from 2.3.0 on, and everything written before that is CommonJS, so
// without this entry the majority of callers cannot use the package at all.
//
// Why wrap mechanically instead of transpiling: the sources use four constructs and no
// others — a default import, `export default`, `export {…}`, and no import.meta, no dynamic
// import. Node 14 already reads every bit of the rest, so the build only has to turn an
// import into "read the earlier module's exports" and attach the exports to module.exports.
// No tool, therefore nothing that drifts between the source and the build.
//
// Why not a hand-written CommonJS copy: that is a second copy of the same logic, and
// changing one and forgetting the other is a certainty — 54 dictionary files make it worse.
// scripts/build-cjs.mjs regenerates the file from the source every time, and the build fails
// on any construct it does not recognise instead of producing a broken file quietly.
//
// The output is built in memory and compared with the file in dist/: if they match, nothing
// is written. The file is committed, so what ships is what `git diff` shows.
//
// Usage: node scripts/build-cjs.mjs [--check]
//   --check compares without writing; it exits 1 when the two disagree. prepack and pretest
//   use that form, so a source edit without a rebuild cannot be committed or published.

import {readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import process from 'node:process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = join(ROOT, 'dist', 'index.cjs');
const checkOnly = process.argv.includes('--check');

// Files in the order they are evaluated: a file may only import something listed before it.
// Kept as a list rather than derived from the imports so that the order is visible in one
// place; the direction of every import is asserted below.
const ORDER = [
    'v2/b.js', 'v2/br.js', 'v2/c.js', 'v2/ch.js', 'v2/chr.js', 'v2/cr.js',
    'v2/d.js', 'v2/dr.js', 'v2/f.js', 'v2/fr.js', 'v2/g.js', 'v2/gr.js',
    'v2/h.js', 'v2/hr.js', 'v2/j.js', 'v2/jr.js', 'v2/k.js', 'v2/kr.js',
    'v2/l.js', 'v2/lr.js', 'v2/m.js', 'v2/mr.js', 'v2/n.js', 'v2/nr.js',
    'v2/p.js', 'v2/pr.js', 'v2/q.js', 'v2/qr.js', 'v2/r.js', 'v2/rr.js',
    'v2/s.js', 'v2/sh.js', 'v2/shr.js', 'v2/special.js', 'v2/sr.js',
    'v2/t.js', 'v2/tr.js', 'v2/v.js', 'v2/vr.js', 'v2/w.js', 'v2/wr.js',
    'v2/x.js', 'v2/xr.js', 'v2/y.js', 'v2/yr.js', 'v2/yunmu.js', 'v2/yunmur.js',
    'v2/z.js', 'v2/zh.js', 'v2/zhr.js', 'v2/zr.js',
    'v2/index.js',
    'workaround/index.js',
    'v1/index.js',
    'index.js',
];

const source = (file) => readFileSync(join(ROOT, file), 'utf8');

// Indentation is added line by line and empty lines stay empty; otherwise the diff fills up
// with lines that differ only in whitespace.
const indented = (text, depth) => text
    .split('\n')
    .map((line) => (line === '' ? '' : '    '.repeat(depth) + line))
    .join('\n');

// A relative specifier resolves against the importing file's directory. Every file in ORDER
// imports its neighbours as './x.js', so a plain join is enough; anything else is an error.
function resolveSpecifier(from, specifier) {
    if (!specifier.startsWith('./')) {
        throw new Error(`${from}: only relative imports are handled, got '${specifier}'`);
    }
    return join(dirname(from), specifier.replace(/\.js$/, '.js')).replace(/\\/g, '/');
}

// ---------------------------------------------------------------------------------------
// Wrapped modules
// ---------------------------------------------------------------------------------------

/**
 * Wrap one module's source into an IIFE whose return value plays the part of its exports.
 *
 * Finished modules do not find each other through require — the output is a single file and
 * there is no v1/ in dist/ to require — so an import becomes "read the slot of the module it
 * points at", and ORDER has to list that module first.
 *
 * The imports are converted to read `__exports[name]` instead of `__modules[at]`, because by
 * the time a module runs it has already been given the exports object of everything it needs
 * and written its own onto the same object. That is what lets a later assignment in
 * index.js (`module.exports.v2 = …`) be visible through a namespace object.
 *
 * `mode` decides how the module's own declarations land:
 *   'reassign' — index.js, whose body assigns module.exports more than once. Plain ESM
 *                semantics: the last assignment wins.
 *   'define'   — everything else, whose source does not assign module.exports at all. Each
 *                export is written onto the local object, and the default export is attached
 *                on top of the named ones afterwards (the order matters, see attachDefault).
 */
function wrapModule(file, code, mode, at) {
    const body = code.replace(
        /^import\s+(?:\{\s*default\s+as\s+(\w+)\s*\}|(\w+))\s+from\s+'(\.[^']+)';?\s*$/gm,
        (_, braces, plain, specifier) => {
            const name = braces || plain;
            const target = resolveSpecifier(file, specifier);
            const at = ORDER.indexOf(target);
            if (at === -1 || at >= ORDER.indexOf(file)) {
                throw new Error(`${file}: ${target} is imported but does not come before it in ORDER`);
            }
            return `const ${name} = __exports[${at}].default;`;
        }
    );

    // The binding the default export names — `export default toPinyinTones;` gives
    // 'toPinyinTones'. A trailing comment is allowed because workaround/index.js writes
    // `export default markSinglePinyinVowel; // 导出函数`. The dictionary files write
    // `export default{…}` with the object inline, which has no name; null says so, and those
    // files get no default attached.
    const defaultName = /^export default\s*(\w+)\s*;[ \t]*(?:\/\/.*)?$/m.exec(body)?.[1] ?? null;

    // The export block in index.js spans several lines, hence [\s\S]; g matters because
    // v2/index.js has one `export default` and two `export {…}` lines. One dictionary file
    // writes `export default{` with no space, so \s* rather than \s+.
    //
    // In 'define' mode the named exports go onto a separate `__named` object: the default
    // export was just assigned to `module.exports`, and writing the named ones to the same
    // place would overwrite a function with an object, or a dictionary with its own members.
    // attachDefault merges the two afterwards, in the direction that keeps the default.
    const named = mode === 'define' ? '__named' : 'module.exports';
    const withExports = body
        .replace(/^export default\s*/gm, mode === 'reassign' ? 'module.exports = ' : 'module.exports.default = ')
        .replace(/^export\s*\{([^}]*)\};?/gm, (_, names) => {
            const entries = names.split(',').map((n) => n.trim()).filter(Boolean);
            return entries.map((name) => {
                // `export {a};` and `export {a as b};` are two different declarations.
                const rename = /^(\w+)\s+as\s+(\w+)$/.exec(name);
                return rename
                    ? `${named}.${rename[2]} = ${rename[1]};`
                    : `${named}.${name} = ${name};`;
            }).join('\n');
        });

    if (withExports === body) {
        throw new Error(`${file}: no export was rewritten, so the wrapping rules are out of date`);
    }

    const leftover = withExports.match(/^\s*(import|export)\b.*$/m);
    if (leftover) {
        throw new Error(`${file}: '${leftover[0].trim()}' was not handled — the wrapping rules need updating`);
    }

    // The module's default is the thing callers call, and that has to hold for named exports
    // too: `const {convertUnspacedPinyin} = require('pinyin-tone/v2')` is read off the same
    // object that `require('pinyin-tone/v2')('ni3')` calls. Putting the names on the function
    // serves both, and the reverse — a plain object — leaves the default export unreachable
    // from require.
    //
    // So in 'define' mode the default goes on last: the named exports were written to their
    // own object, and this merges them into the default, which stays the value of
    // module.exports. Dictionary files export an object with nothing named beside it, and
    // defaultName is null for them.
    const defineMode = mode === 'define';
    const attachDefault = defineMode && defaultName !== null
        ? [
            `module.exports = Object.assign(${defaultName}, __named);`,
            // The merge above replaces the object `module.exports.default` was written to, so
            // the property has to be put back — otherwise a module that reads
            // `__exports[at].default` gets undefined and every import of this file breaks.
            'module.exports.default = module.exports;',
        ].join('\n')
        : null;
    // 'define' mode needs a second object for the named exports, so that the default — a
    // function, or a dictionary object — is never overwritten by them.
    const localExports = mode === 'reassign'
        ? 'const module = {exports: {}};'
        : 'const module = {exports: {}};\nconst __named = {};';

    return [
        '(function () {',
        // Each module gets its own exports object, and the module's result is copied onto
        // the shared slot at the end. Two objects, two jobs: a module can reassign its local
        // `module.exports` (index.js does) without cutting the slot loose, and the shared
        // slot keeps the identity that later modules hold on to.
        //
        // The copy happens in both modes. In 'define' mode the module writes its exports
        // onto the local object, so without the copy the slot stays empty and every file
        // that imports it reads `undefined` — the package entry, which reads v1, v2 and
        // workaround, then fails on its first assignment.
        indented(`${localExports}\n${withExports.trimEnd()}`, 1),
        attachDefault && `    ${attachDefault}`,
        `    __exports[${at}] = module.exports;`,
        '    return module.exports;',
        '})()',
    ].filter(Boolean).join('\n');
}

// Every .js under the four shipped paths has to be in ORDER, or it would silently not ship.
const onDisk = ['index.js'];
for (const dir of ['v1', 'v2', 'workaround']) {
    for (const name of readdirSync(join(ROOT, dir))) {
        if (name.endsWith('.js')) onDisk.push(`${dir}/${name}`);
    }
}
const missing = onDisk.filter((f) => !ORDER.includes(f));
const extra = ORDER.filter((f) => !onDisk.includes(f));
if (missing.length || extra.length) {
    throw new Error(`ORDER does not match the sources — missing: ${missing.join(', ') || 'none'}; ` +
        `not on disk: ${extra.join(', ') || 'none'}`);
}

// The last slot is the package entry; everything before it is a module it reaches.
const ENTRY = ORDER.length - 1;
const modules = ORDER.map((file, at) => wrapModule(file, source(file), file === 'index.js' ? 'reassign' : 'define', at));

// One implementation, several entry files.
//
// dist/index.cjs holds every module and is where the code lives. The three subpath entries are
// a wrapper each, handing back the one module's exports object out of that file — twenty lines
// that require it, not a second copy of the dictionary.
//
// Why the entries cannot all point at dist/index.cjs: Node reads `exports` once and hands the
// caller whatever that file puts in module.exports. One file can only export one object, so
// `require('pinyin-tone')`, `require('pinyin-tone/v2')` and the other two would have to share
// it, and v2 would lose its named exports to whichever shape won. A file per subpath costs
// three small files and gives each one the shape it declares.
const wrapper = (at) => [
    '// Generated file — do not edit. The code is in dist/index.cjs; rebuild with',
    "// `npm run build:cjs`. This file only hands back one module's exports out of it.",
    "const core = require('./index.cjs');",
    '',
    `module.exports = core.__modules[${at}];`,
    '',
    '// For transpiled ES modules, which read require() results as `.default`.',
    `module.exports.default = core.__modules[${at}];`,
    '',
].join('\n');

const output = [
    '// Generated file — do not edit. The source is in index.js, v1/, v2/ and workaround/;',
    '// rebuild with `npm run build:cjs`. scripts/build-cjs.mjs wraps those files verbatim: the',
    '// logic is the same as the ESM entry, with imports read off the slot of the module they',
    '// name and exports written onto module.exports.',
    '',
    "'use strict';",
    '',
    // Two arrays: one exports object per module, prepared before any of them runs, and one
    // slot holding that module\'s result. An import reads the first; the whole file is
    // evaluated in ORDER so a module only ever reads objects that already exist.
    '// One exports object per module, in dependency order.',
    'const __exports = [',
    ...ORDER.map(() => '    {},'),
    '];',
    '',
    '// The result of evaluating each module; index.js is the last one. The subpath entries in',
    '// this directory read a single slot out of here instead of exporting their own copy.',
    'const __modules = [];',
    '',
    modules.map((code, at) => `__modules[${at}] = ${code};\n`).join(''),
    // What require() gets is what the ESM entry's default export is: the function itself,
    // with v2 and markSinglePinyinVowel hanging off it, because index.js already attached
    // them. A wrapper like {default: fn} would break every CommonJS caller written against
    // 2.2.x, where the function was the export.
    //
    // `.default` is added for interop: transpiled ES modules read
    // `require(\'pinyin-tone\').default`, and so does Node\'s loader when an ESM file imports
    // a CommonJS one.
    'const root = __modules[__modules.length - 1];',
    '',
    'module.exports = root;',
    'module.exports.default = root;',
    '',
    '// Kept on the object the subpath entries read through, and also hung off the function so',
    '// that `require(\'pinyin-tone\').v2` keeps working as it did in 2.2.x.',
    `module.exports.v1 = __exports[${ORDER.indexOf('v1/index.js')}].default;`,
    `module.exports.v2 = __exports[${ORDER.indexOf('v2/index.js')}].default;`,
    `module.exports.workaround = __exports[${ORDER.indexOf('workaround/index.js')}].default;`,
    '',
    'module.exports.__modules = __modules;',
    '',
].join('\n');

// Path → contents, for the comparison and the write loop below.
const outputs = new Map([[TARGET, output]]);
for (const [name, file] of [['v1', 'v1/index.js'], ['v2', 'v2/index.js'], ['workaround', 'workaround/index.js']]) {
    outputs.set(join(ROOT, 'dist', `${name}.cjs`), wrapper(ORDER.indexOf(file)));
}

const stale = [];
for (const [path, next] of outputs) {
    const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
    if (current !== next) stale.push([path, next]);
}

// --check runs from prepack, whose output ends up in the stdout of `npm pack --json`, where
// it breaks JSON.parse downstream. So problems go to stderr and success says nothing; only an
// interactive run (without --check) prints progress for a human.
if (stale.length === 0) {
    if (!checkOnly) console.log(`${outputs.size} files in dist/ are up to date`);
    process.exit(0);
}

if (checkOnly) {
    console.error(`out of sync with the sources, run \`npm run build:cjs\`: ` +
        stale.map(([path]) => path.slice(ROOT.length + 1).replace(/\\/g, '/')).join(', '));
    process.exit(1);
}

mkdirSync(join(ROOT, 'dist'), {recursive: true});
for (const [path, next] of stale) writeFileSync(path, next);
for (const [path, next] of outputs) {
    console.log(`dist/${path.slice(join(ROOT, 'dist').length + 1).replace(/\\/g, '/')} ` +
        `(${next.split('\n').length} lines, ${(Buffer.byteLength(next) / 1024).toFixed(1)}KB)`);
}
