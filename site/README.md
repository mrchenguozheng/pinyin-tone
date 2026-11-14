# pinyin-tone site

Live demo for [`pinyin-tone`](https://www.npmjs.com/package/pinyin-tone): type
numeric pinyin (`han4 yu3`), get tone-marked pinyin (`hàn yǔ`). The page runs all
three published generations of the library against the same input — v1, v2 and the
3.0 rewrite — so their differences can be seen, not described.

Served at <https://mrchenguozheng.github.io/pinyin-tone/>. The site is built by the
library's Pages workflow and shares that root with `CONTRIBUTORS.svg`, so
`astro.config.mjs` keeps `base: '/pinyin-tone'` and every in-site path is built from
`import.meta.env.BASE_URL` — note it has no trailing slash.

This directory never reaches npm: `scripts/check-pack.mjs` at the repository root fails if
anything under `site/` shows up in the tarball — the same guard that keeps `docs/` out.

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # static build into dist/
npm run preview   # serve the build
```

## How the versions are pinned

`pinyin-tone` stays at **2.5.2**, the last release of the 2.x line (the `legacy`
tag on npm), because 2.x is the last line that ships the `v1` root export and the
`v2` subpath this page demonstrates. 3.0 removed both and replaced them with a
single named `markTones`, so it is installed under the alias `pinyin-tone-v3`:

```json
"pinyin-tone": "2.5.2",
"pinyin-tone-v3": "npm:pinyin-tone@3.0.1"
```

Both pins are exact — no `^`, no `~` — because the page is a record of what those
two specific releases do, not a mirror of `latest`. 2.4.1 is deprecated on npm
(its `/v2` entry sliced the input) and must not be reintroduced here.

All three generations are re-exported from `src/common/functions.ts`; the page
imports from there and nowhere else. The v3 alias tracks the published release on
purpose: the page should show what people actually install, not what `master`
happens to contain. Bump it after a release.

## Test cases

`src/common/cases.json` is the only copy of the test matrix: this page imports it,
and so does `test/test-cases-fixture.js` in the repository root, which checks the
17 rows for gaps and duplicate ids. Each row declares which version's output it
asserts; rows 13–17 assert v3 only, because they are exactly the inputs where 3.0
diverges from 2.x (unspaced input, capitalised syllables, pinyin glued to Han
characters, the three writings of ü).

A declared expectation that does not match fails the build, not just the cell. At
runtime each cell is computed inside its own `try`/`catch`, so a call that throws
prints `✗ 抛错: <message>` in that cell instead of blanking the row.

## License

MIT
