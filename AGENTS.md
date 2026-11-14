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
npm run release:ready    # is there anything to release? exit 0 = yes, 1 = no
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
- **A GitHub action's major version is welded to the runner's Node runtime**, and Node 20 is deprecated:
  actions still targeting it get forced onto Node 24 and print a warning on every run. Choose the major
  by reading `runs.using` in the action's `action.yml` (node24), not by release date. This repository sits on
  checkout/setup-node `v5`, configure-pages `v6`, upload-pages-artifact `v5`, deploy-pages `v5`.
- **`ubuntu-latest` is a moving platform, not a constant** (it moved to Ubuntu 26 in late 2026), so every
  job names its image explicitly: all three workflows run on `ubuntu-26.04`. Changing that label is its own
  change, verified by a rehearsal run, never by "latest just moved us".
- **A release needs three deliberate human acts**: an annotated tag (`git tag -a`, which the gate checks
  with `git cat-file -t` — a lightweight tag is rejected and would otherwise ride along with
  `git push --tags`), an approval on the `npm-publish` environment (only enforced once required reviewers
  are set in repository settings; without protection rules it silently behaves as if absent), and a
  maintainer approving the staged version on npmjs.com with 2FA.
- **The npm trust relationship only grants `npm stage publish`**, so CI calls `npm stage publish` and never
  `npm publish` (the registry rejects the latter under that permission). Staging parks the tarball in a
  waiting area: the registry shows nothing until the approval above. Staged and published versions share
  one version-uniqueness index, so a stale staged version blocks that number in both directions — reject
  it (`npm stage reject`) before retrying. Short-lived OIDC tokens cannot run `npm stage list/view/reject`;
  those need a maintainer's own session. Staged publishing requires npm >= 11.15.0 and Node >= 22.14, which
  is why `publish.yml` installs `npm@>=11.15.0 <12`.
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

## Deciding whether a release is warranted

Agents prepare releases; they never press the button. Preparing means bumping `package.json`, renaming the
`## 未发布` heading, committing, and showing the rehearsal log. `git tag -a`, the `npm-publish` approval
and the npmjs.com approval all belong to a maintainer — a tag is the one artifact here that cannot be
taken back.

Release when `## 未发布` holds at least one bullet a user of the published package can observe:

| Change | Version | Why |
| --- | --- | --- |
| a wrong conversion is fixed, API unchanged | patch, e.g. `3.0.2` | the string a user gets back changes |
| a new option or export, old behaviour intact | minor, e.g. `3.1.0` | additive; existing installs unaffected |
| an existing input converts differently, or an export / `.d.ts` signature changes | major, e.g. `4.0.0` | installed code can break |
| only `docs/`, `test/`, `.github/`, `AGENTS.md`, `CHANGELOG.md` changed | no release | nothing a user receives |
| a 2.x regression fix | patch on `maintain/2.x`, e.g. `2.5.3` | never `2.6`, never on `master` |

Rules that keep the above from becoming a guess:

- **One release per batch, not per commit.** Wait until a user-visible change exists; a docs-only week is
  not a version.
- **Evidence before proposing.** `npm test` green plus a rehearsal run (`workflow_dispatch` from `master`,
  `dry_run` on), and quote its pack summary line. A proposal without that is just an opinion.
- **`npm run release:ready` decides the hard part.** It exits 0 when `lib/` or `dist/` changed since the
  last tag and 1 when they did not — the package ships only those two directories, so "no change there"
  means the tarball would differ only in its version number. It does not pick patch/minor/major; that
  needs someone reading the diff, comparing `lib/index.d.ts` for added or narrowed signatures.
- **Check what actually ships.** `npm run release:ready` prints the files that changed under `lib/` and
  `dist/` since the last tag and the changelog bullet count; empty on both means there is nothing to
  release even if many commits landed.
- **Never propose a version already on the registry** (`npm view pinyin-tone versions`), and never tag a
  commit outside `master` / `maintain/2.x` — the gate rejects both, but proposing them wastes a run.
- **State the reason, not the diff.** "3.0.2 fixes `nve4` converting to `nüe4`" is a release note;
  "update dict.js" is not.

## Definition of done

- `npm test` green. Say the assertion count in the commit message if it moved.
- `site/` build green if you touched the page, its fixtures, or the pins.
- Any new sentence with a number has its claim registered first; any changed number is changed in
  every copy, including the `.zh` twins.
- `CHANGELOG.md` `## 未发布` has a bullet for user-visible behaviour, and the reason — not a
  restatement of the diff.
- No probe or scratch files left behind (`probe-*.mjs`, temporary scripts). The working tree is clean
  apart from what you meant to add.
- **Never run `npm publish` or `npm stage publish` from a working copy.** A release is an annotated tag:
  `git push origin v<version>` starts `.github/workflows/publish.yml`, which re-runs the tests, checks the
  pack contents, verifies the tag against `package.json` and against the release branch, derives the
  dist-tag from the major version, and then only *stages* the tarball (`npm stage publish`). It goes live
  after a maintainer approves it on npmjs.com. See `docs/releasing.md`; a laptop publish or stage bypasses
  every one of those gates.
- Do not rewrite history: prefer a new commit. Do not touch `maintain/2.x` unless the task is
  explicitly about the 2.x line.
