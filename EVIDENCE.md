# Reviewed release evidence

Overall status: PARTIALLY VERIFIED. Historical local sample scanning passed; hosted GitHub Actions is NOT VERIFIED. This is an independent AI-assisted lab.

## Real scanner record
[Original reviewed scan record](evidence/2026-11-13T23-02-53.943Z-717189a9-0470-4ac9-ba13-968f9659fa18.json) — 2026-11-13T23:02:53.943Z, Snyk 1.1308.4, executed=true, completed=true, exitCode=0, packageManager=npm, dependencyCount=1, findingCount=0, PASS.

Command: `snyk test --json --file=package.json`. Adapter cwd: isolated `sample/`. Target: `sample/package.json`, project onboardkit-safe-sample 1.0.0. Current sample fingerprint: `73d057b211c4f343e5235041902450a4cb7c707d7f23bb36ef5fc379a9a82133` (matches record).

The installed official binary SHA-256 is `dfb90210c5fb7d22e163b6518ed35c3634f6e5903932ef51096c3d768cac8f74`, matching the Snyk package's checksum list. The npm wrapper version and lockfile pin are 1.1308.4. Source inspection confirms spawnSync without a shell and the real test command targeting the sample. No fixture is represented as a scan.

Limit: raw stdout and a signed execution attestation were not retained. The unsigned local record and installed code are consistent with the reported execution; they are not independent proof of the original stdout producer or historical PATH/environment. No new scan was performed during this release audit. Authentication was usable at recorded scan time; current credentials were not examined.

## Failure reproduction
[Reviewed configuration exercise](evidence/2026-11-13T22-45-22.542Z-ca3a0c65-d2f8-43de-bc67-77c85a34f288.json) — actual manifest validator subprocess returned exit 1, Missing package.json. Restoring a sample manifest produced exit 0 and PASS. This is not a security scan.

## Final local validation
Commands: `npm ci --ignore-scripts --no-audit --no-fund`, `npm ci --prefix sample --ignore-scripts --no-audit --no-fund`, `npm run check`, `npm test`, `npm test --prefix sample`, `npm run demo`, `npm run verify`, `npm run report`. The clean audit copy used the additional flags `--offline --cache /tmp/onboardkit-npm-cache` for installation from previously retrieved official package tarballs. Test coverage was inspected using `node --test --experimental-test-coverage test/core.test.js`.

Final outcomes, workflow inspection and the precise public file selection are in [RELEASE-AUDIT.md](docs/RELEASE-AUDIT.md). Reviewed file content hashes are in PUBLICATION-MANIFEST.sha256 (generated after final reports). Runtime verification regenerates local events and JSON handover; those events are ignored unless explicitly reviewed. Historical superseded verification events remain in the private working copy, not the public candidate.

## Interpretation correction
The older vulnerability remediation PASS was a reporting defect. It has been corrected to NOT VERIFIED with a regression test: a clean scan never implies that remediation occurred. Historical original events are not edited or rehashed to hide that defect.
