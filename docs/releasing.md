# Releasing

A release is a tag, not a command run on someone's laptop. Push `v<version>` and
`.github/workflows/publish.yml` takes over: it re-runs the tests, inspects the package contents, and
publishes with a provenance statement naming the commit it built from.

The same tag is the only record of what shipped, so the version in `package.json` and the tag name
have to agree — the workflow refuses anything else.

## What runs before the registry is touched

| Gate | Why it exists |
| --- | --- |
| tag equals `package.json` version | otherwise one version ships under another version's number |
| the tagged commit is on the release branch | 3.x from `master`, 2.x from `maintain/2.x`; publishing from a side branch skips that branch's CI |
| the version is not already published | npm rejects a re-publish anyway; failing here says so in one line instead of an HTTP error |
| the dist-tag | 3.x goes to `latest`, 2.x goes to `legacy` — a 2.x patch must never pull default installs back down |
| `npm test` and `npm run pack:check` | a tag push does not start the CI workflow, so this job is the only gate between a tag and the registry |
| `npm publish --provenance` | the published package records the workflow and commit that produced it, verifiable from the registry |

## Releasing 3.x

1. Set `version` in `package.json`.
2. Rename the changelog heading `## 未发布` to `## v<version>` and commit both together.
3. `git tag v<version>` on that commit, then `git push origin v<version>`.
4. Watch the Publish run. It prints the dist-tag it resolved, the branch check, and the pack summary
   before it publishes.

## Releasing 2.x

The same steps on `maintain/2.x`, with two differences: only patch versions (`2.5.3`, never `2.6`),
and the dist-tag is `legacy` — the workflow derives it from the major version, so a 2.x tag cannot
reach `latest` even by mistake. The rules about what 2.x accepts live in
[`maintenance.md`](maintenance.md).

## Rehearsing without publishing

Run the workflow manually with `dry_run` left on (its default), from any branch. Every gate runs —
branch, dist-tag, existing version, tests, pack contents — and the last step is
`npm publish --dry-run`, which prints exactly what would be uploaded. The tag equality check is the
one thing a branch run cannot exercise, since there is no tag.

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
