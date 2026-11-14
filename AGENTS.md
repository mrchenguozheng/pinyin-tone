# Notes for coding agents

This repository is a small library with a large test surface. Almost every rule below exists because
a human had to notice the same mistake by eye, twice. Read this before editing anything.

## What is where

| Path | What it is | Ships to npm |
| --- | --- | --- |
| `lib/` | the whole runtime: 4 files, 71 KB, zero dependencies | yes |
| `dist/` | CommonJS build generated from `lib/` — never edit by hand | yes |
| `test/` | mocha + chai, 15 files, ~360 assertions, ESM | no |
| `docs/` | long-form prose; every page has a `.zh` twin | no |
| `site/` | Astro demo page; has its own `package.json` and lockfile | no |
| `scripts/` | `build-cjs.mjs` (generates and `--check`-compares dist), `check-pack.mjs`, `smoke-entry.cjs` | no |
| `.github/workflows/` | `ci.yml` (tests, engines floor, pack), `publish.yml` (tag → npm), `pages.yml` (demo site) | no |
| `CHANGELOG.md` | Chinese, newest at the top; accumulate under `## 未发布` | no |

`package.json` ships `["lib", "dist"]` and `engines: node >= 14`. There are **no runtime
dependencies**, and that is a design decision, not an accident: this library converts numbered
pinyin to tone marks and nothing else.

## Commands

```sh
npm test                 # pretest runs build-cjs.mjs --check, then mocha, then tsc --noEmit
npm run pack:check       # what npm would publish: file list and sizes
npm run build:cjs        # regenerate dist/ after changing lib/
npm --prefix site run build   # build the demo page (Astro); must print "Complete!"
```

`npm test` is the only command that has to pass before a commit. If you touched `site/`, run the
site build too — the page fails at build time, not at runtime.

## Invariants, and the failure each one prevents

1. **Every number a document prints is registered in `test/test-doc-claims.js`.** The suite recomputes
   the claim from the code and also scans every prose surface — the Markdown pages *and* the text of
   `site/src/pages/index.astro` — for any integer of two digits or more that is not registered, and
   fails with `file:line: 1234 — the sentence`. So: add the claim (with its `computed` value) first,
   then write the sentence. Exempt: code spans, fenced blocks, URLs, CSS and attributes in the page,
   and the changelog.
   *Why:* this file already shipped two wrong numbers ("all 1,548 differences are dropped letters",
   "`workaround`'s 36 inputs") and the prose is copied into seven places.
2. **A number that changes has to change everywhere.** `test-doc-claims.js` will point at each copy
   that still quotes the old value. Do not silence it by widening the allowlist; fix the sentence.
3. **The 17-row demo table lives once, in `site/src/common/cases.json`.** The page imports it;
   `test/test-cases-fixture.js` guards the gaps, the duplicate ids, the absence of `v1`/`v2` expectations
   in rows 13-17, and that the page still imports from the fixture rather than re-declaring the table.
   *Why:* the table used to be a second copy inside the page.
4. **The two pins in `site/package.json` are exact versions, not ranges.** The page reads them at
   build time and prints them; a spec that is not `^\d+\.\d+\.\d+$` (after stripping the `npm:` alias
   prefix) makes the build throw. That is deliberate: the demo exists to show what those two
   versions do.
5. **Read the maintenance rules before touching 2.x.** `docs/maintenance.md` and
   `docs/maintenance.zh.md`: 3.0 lives on `master` (`latest`); `maintain/2.x` (`legacy`, pinned at
   2.5.2) takes regression fixes only, as patches (`2.5.3`, never `2.6`). A fix lands on `master` first
   and is backported only when the bug is 2.x's own. Backports must be green on that branch's CI, not
   only on `master`.
6. **`dist/` is generated.** Run `npm run build:cjs`, never hand-edit; `--check` fails the build when
   the committed output no longer matches `lib/`. The generated files use LF and are compared as text.

## Traps that have already bitten

- **Never `import ... with { type: 'json' }` in test files.** The attribute form starts at Node 20.10
  and CI also tunes older 20.x, so use `JSON.parse(readFileSync(new URL('../x.json', import.meta.url), 'utf8'))`.
- **Never read `package.json` through `import.meta.url` in the page's build-time code.**
  `readFileSync(new URL('../../package.json', import.meta.url))` resolves against the *bundled*
  location during Astro prerender (`site/dist/.prerender/chunks/`), so it tries to open
  `site/dist/package.json` and dies with ENOENT. Import the JSON directly (Vite handles it):
  `import sitePackage from "../../package.json"`.
- **`npm pack --json` changes shape between npm majors**, and the two npm versions in play disagree:
  npm 11 prints an array of one entry, npm 12 prints an object keyed by package name. `scripts/pack-json.mjs`
  normalises both, `test/test-pack-json.js` pins both shapes, and `publish.yml` installs npm 11 (the
  minimum that supports Trusted Publishing) rather than the newest for exactly this reason. The first
  Publish run died on `const [info] = JSON.parse(raw)` because it had never met the object form.
- **`pinyin-tone-2` is an alias for 2.5.2**, not 2.4.1: `"pinyin-tone-2": "npm:pinyin-tone@2.5.2"`.
  It is the only way the tests can compare 3.0 against the old line. Importing `pinyin-tone-2/v2`
  relies on 2.5.2's `exports` map — the file path `v2/index.js` no longer resolves.
- **`markTones(key, { strict: true })` does not throw on an unknown key.** It returns the input
  unchanged, so "did strict reject it" has to be decided by whether any of the four tones produces a
  glyph — never by `try/catch`.
- **npm installs here go through a local mirror.** Any new lockfile entry with
  `registry.npmmirror.com` must be rewritten to `registry.npmjs.org` before committing, in both root and
  `site/` lockfiles.
- **A `2.4.1` behaviour must not be described from memory.** Its `/v2` slices rather than parses
  (`Hao3` → `ao`), which 2.5.2 fixed. Check against `pinyin-tone-2` (2.5.2) before writing a sentence.

## Where the quoted numbers come from

`test/test-doc-claims.js` computes them; these are the shapes, so you can reproduce any of them by hand:

| Claim | How it is computed |
| --- | --- |
| 1952 keys | `Object.keys(lib/dict.js)` |
| 13,664 inputs | each key × seven spellings (`''`, `0`-`5`) |
| 1,548 / 966 / 509 / 73 | 2.5.2 root entry vs `markTones`, then bucketed by output length |
| 259 / 38 | 2.5.2 `/v2` vs `markTones`, and the keys those differences fall on |
| 876 / 1076 | any of tones 1-4 produces a glyph under `strict` |
| 426 + 418 + 32 = 876 | standard syllables + erhua + literal `jv`, checked as a sum |
| 42 spellings | six vowels × seven notations, compared one by one against `/workaround` |

`test/test-divergence.js` re-derives the same comparisons independently, and quotes the sample values
the docs print (`biou1`, `jvn`, `jv1`, `m1`, `e^1`), so a doc row cannot be right while the code
disagrees.

## Definition of done

- `npm test` green. Say the assertion count in the commit message if it moved.
- `site/` build green if you touched the page, its fixtures, or the pins.
- Any new sentence with a number has its claim registered first; any changed number is changed in
  every copy, including the `.zh` twins.
- `CHANGELOG.md` `## 未发布` has a bullet for user-visible behaviour, and the reason — not a
  restatement of the diff.
- No probe or scratch files left behind (`probe-*.mjs`, temporary scripts). The working tree is clean
  apart from what you meant to add.
- **Never run `npm publish` from a working copy.** A release is a tag: `git push origin v<version>`
  starts `.github/workflows/publish.yml`, which re-runs the tests, checks the pack contents, verifies
  the tag against `package.json`, checks the commit is on the release branch, and derives the dist-tag
  from the major version. See `docs/releasing.md`; a laptop publish bypasses every one of those gates.
- Do not rewrite history: prefer a new commit. Do not touch `maintain/2.x` unless the task is
  explicitly about the 2.x line.
