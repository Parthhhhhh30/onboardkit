# ONBOARDKIT
Developer Tool Implementation & Verification Workbench

**Independent, AI-assisted portfolio demonstration. PARTIALLY VERIFIED.** No work for Snyk or an enterprise customer is implied.

A small local CLI for implementation preflight, an explicitly approved real Snyk Open Source scan of one safe sample, evidence recording, verification and customer handover. No dashboard, database or hosting is required. It does not perform SAST, scan arbitrary repositories, establish exploitability, fix vulnerabilities automatically, monitor projects or prove production security.

## Install and run
Requires Node.js 22+, npm and Git on macOS or Linux, with network access to npm and the official Snyk download service for first setup. Start in this repository directory:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm ci --prefix sample --ignore-scripts --no-audit --no-fund
./node_modules/.bin/snyk --version
npm run check
npm test
npm test --prefix sample
npm start --prefix sample -- 'Example onboarding'
npm run doctor
npm run demo
npm run scan
npm run verify
npm run report
```

Run each command separately: doctor exits 2 when authentication needs action; scan without approval exits 2 and records BLOCKED; verify/report exit 2 for partial verification. Those are expected honest outcomes, not successful security scans. The scanner is pinned in the root lockfile. Lifecycle scripts are disabled during dependency installation; its official wrapper downloads and verifies the platform binary when first invoked with `--version`. This is a tool download, not account connection or project analysis. The sample pins picocolors 1.1.1 (ISC, no install scripts), used for terminal output; no deliberately vulnerable dependency is introduced.

## Approve a real scan
Only after you approve Snyk account/service use and transmission of this sample's dependency metadata, run the official interactive authentication flow in your own terminal:

```sh
./node_modules/.bin/snyk auth
npm run scan -- --approve-service-use
npm run verify
npm run report
```

Never paste secrets into chat or source files. Secure `SNYK_TOKEN` or `SNYK_OAUTH_TOKEN` environment variables are also supported by the scanner. Doctor can report ready to attempt a scan when tools and credential environment variables are present; it checks presence, not validity; it does not read local authentication files. A local OAuth login may exist even when doctor reports no environment credential. The real scan is the integration check. The flag approves service use for that invocation only; it never creates monitored projects. A recorded real scan completed on 13 November 2026 at 23:02:53 UTC with zero reported vulnerabilities across one npm dependency. The release audit inspected that existing evidence; it did not run another scan or establish current account access.

Equivalent direct syntax is `node src/cli.js <command>`. `verify --approve-service-use` first performs a fresh real scan. Plain verify/report stay local and use the latest recorded attempt only if its sample fingerprint matches the current source, manifest and lockfile. They never fall back to an earlier green scan after a later failure. Reports rerun tests and evidence checks. Hosted CI remains NOT VERIFIED in local reports; inspect an actual hosted run separately.

## Status and exit semantics
| Operation | Outcome | Workbench exit |
| --- | --- | --- |
| Snyk exit 0, consistent valid JSON | Completed, no vulnerabilities reported | 0 |
| Snyk exit 1, consistent valid JSON | Completed, findings need action | 1 |
| Snyk exit 2 | Scanner execution failure | 1 |
| Snyk exit 3 | Supported project not detected | 1 |
| Malformed/inconsistent JSON, missing sample | FAIL, not completed | 1 |
| Approval or CLI missing | BLOCKED | 2 |
| Verification/report with skipped essential checks | PARTIALLY VERIFIED | 2 |
| Local configuration exercise succeeds | PASS, not a scan | 0 |

Each verification check reports PASS, FAIL, BLOCKED or NOT VERIFIED. A clean scan leaves remediation NOT VERIFIED because no remediation was required or performed. A completed scan with findings can pass integration verification while remediation remains NOT VERIFIED. No clean scan means no claim of a clean dependency set. Stored scan status ACTION REQUIRED means findings were detected.

## Evidence and reports
`evidence/*.json` contains timestamped events with UUID, category and SHA-256 over redacted data. Real executions also store tool version, command, exit status, sample fingerprint and summarized findings. Unit parser fixtures are labeled TEST FIXTURES and never stored as scans. Digests detect accidental edits; anyone with write access could recompute them. This is not a signed or tamper-proof audit system. Only selected finding fields are retained. Review any report before external sharing.

`docs/IMPLEMENTATION-HANDOVER.md` and `.json` are regenerated from current verification and actual recorded events. [EVIDENCE.md](EVIDENCE.md) indexes build observations. [Demo and interview questions](docs/DEMO.md), [troubleshooting](docs/TROUBLESHOOTING.md) and [limitations](docs/LIMITATIONS.md) explain operation.

## CI/CD
`.github/workflows/ci.yml` runs installation, syntax, deterministic tests, sample tests and the manifest exercise on push/PR; it never references scanner secrets. `.github/workflows/security.yml` is a separate manual workflow restricted to the default branch and environment `snyk-security`. It fails with NOT VERIFIED when the environment secret is absent. The token is scoped to the credential-availability check and approved scan steps; installation and scanner initialization receive no scanner token. Checkout credentials are not persisted; workflow permissions are `contents: read`. Actions are pinned to full commit IDs.

With separate authorization to publish, create a repository, protect its default branch, configure environment `snyk-security` with required reviewers and deployment branches restricted to the default branch, add environment secret `SNYK_TOKEN` through GitHub's secure UI, then manually run the security workflow on the reviewed default branch. Review workflow changes before approval. Never switch this workflow to pull_request_target or check out untrusted PR code with credentials. Hosted execution was not performed during this build.

## Repository
```text
.github/workflows/{ci,security}.yml
src/{cli,core,check,manifest-check}.js
sample/{app.js,app.test.js,package.json,package-lock.json}
test/core.test.js
package.json / package-lock.json
PLAN.md / STATUS.md / EVIDENCE.md
README.md
evidence/*.json
docs/IMPLEMENTATION-HANDOVER.{md,json}
docs/{TROUBLESHOOTING,LIMITATIONS,DEMO,REFERENCES,AUDIT}.md
```

## Publication review
The prepared public repository includes only the reviewed real scan and local failure-exercise JSON records. Other local events, scanner caches, dependencies, authentication/configuration files and generated JSON handovers are excluded. The committed Markdown handover is a reviewed historical snapshot; regenerate reports locally and review every change before publishing. Root Snyk tooling and its transitive dependencies were not covered by the sample-only scan. See [release audit](docs/RELEASE-AUDIT.md) for evidence provenance limits and exact publication actions.
