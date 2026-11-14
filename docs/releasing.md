# Releasing

A release is a tag, not a command run on someone's laptop. Push `v<version>` and
`.github/workflows/publish.yml` takes over: it re-runs the tests, inspects the package contents, and
publishes with a provenance statement naming the commit it built from.

The same tag is the only record of what shipped, so the version in `package.json` and the tag name
have to agree — the workflow refuses anything else.

## Whether to release at all

Preparing a release (bumping `package.json`, renaming the changelog heading, committing, showing the
rehearsal log) can be done by an agent; `git tag -a`, the `npm-publish` approval and the npmjs.com approval
belong to a maintainer — a tag is the one thing here that cannot be undone.

A release is warranted only when `## 未发布` holds at least one change the person installing this package
would notice:

| Change | Version | Why |
| --- | --- | --- |
| a conversion was wrong, API unchanged | patch, e.g. `3.0.2` | the string a caller gets back changes |
| a new option or export, old behaviour intact | minor, e.g. `3.1.0` | additive only; installed code is unaffected |
| an existing input converts differently, or an export / `.d.ts` signature changes | major, e.g. `4.0.0` | installed code can break |
| only `docs/`, `test/`, `.github/`, `AGENTS.md`, `CHANGELOG.md` changed | no release | users receive nothing |
| a 2.x regression fix | patch on `maintain/2.x`, e.g. `2.5.3` | never `2.6`, never on `master` |

Four checks keep that from being a guess:

- One release per batch, not per commit; a docs-only week is not a version.
- Evidence before proposing: `npm test` green plus a rehearsal run (`workflow_dispatch` from `master`,
  `dry_run` on), quoting the pack summary it prints.
- `npm run release:ready` answers "is there anything to release" by diffing `lib/` and `dist/` against the
  last tag — the package ships only those, so with no change there the tarball would differ only in its
  version number. Exit code 0 means yes, 1 means no.
- Never propose a version already on the registry (`npm view pinyin-tone versions`), and never tag a
  commit outside `master` / `maintain/2.x` — the gates reject both, at the cost of a wasted run.

## What runs before the registry is touched

| Gate | Why it exists |
| --- | --- |
| the tag must be annotated | a lightweight tag is one keystroke (`git tag v3.0.2`), and `git push --tags` sends a whole batch at once; `-a -m` costs a second flag and records who tagged and why. Only three early tags here are lightweight (`v2.0.3`, `v2.0.4`, `v2.3.5`, all long published); every other one is annotated. |
| a human approves the job | give the `npm-publish` environment required reviewers in repository settings; with that in place a tag push only queues the run for approval. An environment without protection rules behaves as if it does not exist, so this one has to be configured by hand. |
| tag equals `package.json` version | otherwise one version ships under another version's number |
| the tagged commit is on the release branch | 3.x from `master`, 2.x from `maintain/2.x`; publishing from a side branch skips that branch's CI |
| the version is not already published | npm rejects a re-publish anyway; failing here says so in one line instead of an HTTP error |
| the dist-tag | 3.x goes to `latest`, 2.x goes to `legacy` — a 2.x patch must never pull default installs back down |
| `npm test` and `npm run pack:check` | a tag push does not start the CI workflow, so this job is the only gate between a tag and the registry |
| a maintainer approves the staged version | this repository's trust relationship only grants `npm stage publish`: CI can put the tarball in the staging area, but it goes live only after a maintainer clicks Approve in npmjs.com's Staged Packages tab (or runs `npm stage approve <stage-id>` locally), and that step forces 2FA |
| `npm stage publish --provenance` | the published package records the workflow and commit that produced it, verifiable from the registry |

## Releasing 3.x

1. Set `version` in `package.json`.
2. Rename the changelog heading `## 未发布` to `## v<version>` and commit both together.
3. `git tag -a v<version> -m "<one line>"` on that commit, then `git push origin v<version>`.
4. Approve the Publish run in Actions (this step does not appear until required reviewers are configured).
5. Read the log: it prints the dist-tag it resolved, the branch check, and the pack summary, then
   `npm stage publish` moves the tarball into the staging area.
6. Review that version's SHASUM and contents in npmjs.com's Staged Packages, click Approve, and finish
   the 2FA prompt — **the registry does not show the version until this happens**.

Skip step 6 and the version is in limbo: staged and published versions share one version-uniqueness
index, so the same number can neither go live nor be staged again. Reject the staged version and start
over. The OIDC token is a short-lived one and may not run `npm stage list/view/reject`; those have to be
done as yourself, locally or on the web.

## Releasing 2.x

The same steps on `maintain/2.x`, with two differences: only patch versions (`2.5.3`, never `2.6`),
and the dist-tag is `legacy` — the workflow derives it from the major version, so a 2.x tag cannot
reach `latest` even by mistake. The rules about what 2.x accepts live in
[`maintenance.md`](maintenance.md).

## Rehearsing without publishing

Run the workflow manually with `dry_run` left on (its default), from any branch. Every gate runs —
branch, dist-tag, existing version, tests, pack contents — and the last step is
`npm stage publish --dry-run`, which prints exactly what would be uploaded. The tag equality check is
the one thing a branch run cannot exercise, since there is no tag.

The "existing version" gate only warns during a rehearsal: a rehearsal writes nothing to the registry,
and the normal state it runs in is "this version is already out, the next one is not bumped yet". Left
fatal, it would make the rehearsal path unusable exactly when it is most useful.

The dry run does its own registry lookup and refuses a duplicate version outright, so
the rehearsal backs off one more step: when the version is already on the registry, the working copy is
switched to a throwaway `0.0.0-rehearsal` before the dry run (nothing committed, no tag created). The
rehearsal then verifies the mechanics — authentication, file list, dist-tag, whether `--provenance` is
accepted — rather than the version number, and the repository version stays untouched.

A `pinyin-tone-0.0.0-rehearsal.tgz` in the log is therefore expected and is not a name to publish.
On a real publish the duplicate check stays a hard stop: `3.0.1` is already on the registry, so the
next release has to bump to `3.0.2`.

A real publish is only reachable from a tag: dispatching the workflow on a branch with `dry_run` off
fails on purpose, because a release without a tag leaves no record of what shipped and the provenance
statement would name a branch instead of a version.

## One-time npm setup

**Nothing is stored in this repository.** There is no npm token in the repository secrets, and none is
needed: publishing authenticates through npm's Trusted Publishing, which issues a short-lived credential
to this exact workflow on each run.

The prerequisite is on npm's side, and only the package owner can set it: on the package page, under
settings, add a trusted publisher of type GitHub Actions with the repository
`mrchenguozheng/pinyin-tone` and the workflow filename `publish.yml`. From then on the OIDC token
issued to that workflow is the credential, and there is nothing to rotate or leak.

That trust relationship's permission is set to **`npm stage publish`**, not `npm publish`: the workflow
can stage a version but cannot put it live, which is why every release ends with a maintainer approval
and a 2FA prompt on npmjs.com. `npm publish` from CI is rejected by the registry under this setting,
so the workflow deliberately calls `npm stage publish`.

Until that entry exists, a real publish fails — the workflow's first job is to say so in one line
("neither OIDC nor a token"), rather than letting npm answer with an opaque HTTP error. If you would rather
not use Trusted Publishing yet, the fallback is a granular automation token in a repository secret
named `NPM_TOKEN`; the publish step picks it up when present. In that case the long-lived token is the
credential, so revoke it at npm as soon as Trusted Publishing is configured.

## Verifying a release

```sh
npm view pinyin-tone dist-tags        # latest 3.x, legacy 2.x
npm view pinyin-tone@<version> dist.integrity
npm audit signatures                 # checks the provenance attestation of an installed tree
```

The demo page pins both lines by exact version (`docs/` and `site/README.md` explain why); a release
that skips the page shows up there as a stale pin rather than as a broken install.
