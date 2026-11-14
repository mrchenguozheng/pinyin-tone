# Maintenance

Two lines are alive at once. This page says which one takes what, so a bug report does not need a
decision from the maintainer before it can be fixed.

| Line | Branch | dist-tag | Accepts |
| --- | --- | --- | --- |
| 3.0 | `master` | `latest` | features, API changes, fixes |
| 2.x | `maintain/2.x` | `legacy`, pinned to 2.5.2 | regression fixes only |

- **A fix goes to `master` first.** It is backported to `maintain/2.x` only when the bug is in 2.x's
  own behaviour — something 2.x got wrong, not something 3.0 introduced — and only as a patch:
  `2.5.3`, never a `2.6`.
- **No features, no API changes on `maintain/2.x`.** That line is frozen at 2.5.2's surface: the
  same three exports, the same signatures. `pinyin-tone/v1` stays deleted there too.
- **`2.4.1` stays deprecated.** `legacy` does not move off `2.5.2`; 2.4.1 remains installable for
  whoever pinned it, but it is not a target and its `/v2` slicing is not coming back.
- **A release passes both jobs that already run.** `npm test` (which includes
  `build-cjs.mjs --check`, mocha, and `tsc --noEmit`) plus `npm run pack:check`. `maintain/2.x` has
  its own CI, so a backport has to be green there as well — green on `master` alone is not
  evidence that 2.x still works.
- **When the two fixes differ, they are two commits.** 2.x carries code 3.0 deleted, so the same
  bug can need a different change on each line. The changelog entry names the line it shipped on;
  the migration pages describe behaviour, not history.
