# Reviewed release evidence

Hosted Local checks: VERIFIED. [Run 43531269743](https://github.com/Parthhhhhh30/onboardkit/actions/runs/43531269743) completed successfully at commit `2e3a91fd4bf4bf8be92271ebb52e9adb03de67e1` on 14 November 2026. It ran installation, syntax checks, 27 workbench tests, 2 sample tests and the controlled failure exercise. Historical local Snyk: RECORDED; hosted Snyk: NOT PERFORMED; remediation: NOT VERIFIED. This is an independent AI-assisted lab.

## Real scanner record
[Original reviewed scan record](evidence/2026-11-13T23-02-53.943Z-717189a9-0470-4ac9-ba13-968f9659fa18.json) — 2026-11-13T23:02:53.943Z, Snyk 1.1308.4, executed=true, completed=true, exitCode=0, packageManager=npm, dependencyCount=1, findingCount=0, PASS.

Command: `snyk test --json --file=package.json`. Adapter cwd: isolated `sample/`. Target: `sample/package.json`, project onboardkit-safe-sample 1.0.0. Current sample fingerprint: `73d057b211c4f343e5235041902450a4cb7c707d7f23bb36ef5fc379a9a82133` (matches record).

The installed official binary SHA-256 is `dfb90210c5fb7d22e163b6518ed35c3634f6e5903932ef51096c3d768cac8f74`, matching the Snyk package's checksum list. The npm wrapper version and lockfile pin are 1.1308.4. Source inspection confirms spawnSync without a shell and the real test command targeting the sample. No fixture is represented as a scan.

Limit: raw stdout and a signed execution attestation were not retained. The unsigned local record and installed code are consistent with the reported execution; they are not independent proof of the original stdout producer or historical PATH/environment. No new scan was performed during this release audit. Authentication was usable at recorded scan time; current credentials were not examined.

## Failure reproduction
[Reviewed configuration exercise](evidence/2026-11-13T22-45-22.542Z-ca3a0c65-d2f8-43de-bc67-77c85a34f288.json) — actual manifest validator subprocess returned exit 1, Missing package.json. Restoring a sample manifest produced exit 0 and PASS. This is not a security scan.

## Final local validation
Commands: `npm ci --ignore-scripts --no-audit --no-fund`, `npm ci --prefix sample --ignore-scripts --no-audit --no-fund`, `npm run check`, `npm test`, `npm test --prefix sample`, `npm run demo`, `npm run verify`, `npm run report`. The clean audit copy used the additional flags `--offline --cache /tmp/onboardkit-npm-cache` for installation from previously retrieved official package tarballs. Test coverage was inspected using `node --test --experimental-test-coverage test/core.test.js`.

Final outcomes, workflow inspection and the precise public file selection are in [RELEASE-AUDIT.md](docs/RELEASE-AUDIT.md). PUBLICATION-MANIFEST.sha256 tracks current reviewed file hashes, excluding itself. The original 28-file release and its original manifest remain available at [the published release commit](https://github.com/Parthhhhhh30/onboardkit/tree/2e3a91fd4bf4bf8be92271ebb52e9adb03de67e1). Documentation revisions update current hashes without changing that earlier snapshot. Runtime verification regenerates local events and JSON handover; those events are ignored unless explicitly reviewed. Historical superseded verification events remain in the private working copy, not the public candidate.

## Interpretation correction
The older vulnerability remediation PASS was a reporting defect. It has been corrected to NOT VERIFIED with a regression test: a clean scan never implies that remediation occurred. Historical original events are not edited or rehashed to hide that defect.

## Reading historical records
The dated release audits and committed handover describe pre-publication observations and are preserved unchanged. Their historical hosted-CI status is superseded by the actual successful run linked above. Local CLI reports do not fetch hosted Actions status; their NOT VERIFIED field is not a new assessment of that run.
