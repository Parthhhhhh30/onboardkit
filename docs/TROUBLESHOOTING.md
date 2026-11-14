# Troubleshooting
| Symptom | Diagnosis | Corrective action | Rerun |
| --- | --- | --- | --- |
| doctor reports missing scanner | npm install or platform download incomplete | npm ci --ignore-scripts, then ./node_modules/.bin/snyk --version | npm run doctor |
| No credential environment variable | Presence check cannot see secure local OAuth login | After service approval, run ./node_modules/.bin/snyk auth in your terminal | npm run scan -- --approve-service-use |
| Scanner exit 2 | Scanner execution failure; may be auth, network or configuration | Read redacted diagnostic; check account authorization, proxy and official regional endpoint guidance. Do not disable TLS. | Approved scan command |
| Scanner exit 3 | No supported project | Restore sample/package.json and lockfile; run npm ci --prefix sample --ignore-scripts | Approved scan command |
| Scanner exit 1 | Completed scan found vulnerabilities | Review finding IDs/severity and official remediation guidance; update safely and test | New approved scan and report |
| Malformed response | Unexpected scanner JSON or schema | Check pinned Snyk version and current documentation; do not substitute fixtures | Tests, then real scan |
| npm ENOTFOUND | DNS/network restrictions | Restore permitted npm network access; do not change dependencies to hide failure | npm ci --ignore-scripts |
| Integrity failure | Stored JSON changed or corrupted | Preserve the affected evidence for investigation; compare against trusted copies. Regenerate an isolated evidence set only after understanding the cause. | npm run verify |
| Scan no longer verifies | Latest attempt failed, or sample fingerprint changed | Resolve issue and run a fresh approved scan | npm run report |
| Security job missing secret | No secure environment token available | Configure protected environment and secret through GitHub UI | Manual workflow on reviewed default branch |

## Controlled local exercise
`npm run demo` creates a temporary empty project and runs the actual manifest-check subprocess. It records the failure exit and stdout, copies in the sample manifest, reruns the same validator, records the corrected result and removes only its temporary directory. It does not call Snyk or introduce a vulnerable package. Expected failure: exit 1, `Missing package.json`; rerun: exit 0, valid project identity. See the exercise event for actual observations.

Local workbench exit 2 means blocked/partial; Snyk's own exit 2 means scanner failure. The recorded `exitCode` distinguishes them. Avoid debug logs in reports: scanner debug output can contain sensitive configuration.

## Restricted development environments
Snyk 1.1308.4 requires a writable cache and a loopback proxy even for `--version`. ONBOARDKIT uses documented `SNYK_CACHE_PATH` (defaults to ignored `.cache/snyk`) and sets `SNYK_DISABLE_ANALYTICS=1` for scanner subprocesses. A Codex sandbox may still block `listen tcp 127.0.0.1:0`; request the normal sandbox approval or run the CLI from your own terminal. Do not bypass approval controls. During this build, version-only doctor succeeded with approved sandbox escalation. Account use and scanning still require separate service approval.

## Installation and command guidance
Install from both lockfiles with `npm ci --ignore-scripts --no-audit --no-fund` and `npm ci --prefix sample --ignore-scripts --no-audit --no-fund`. The sample uses picocolors 1.1.1 for terminal output. Snyk 1.1308.4 is pinned in the root lockfile; lifecycle scripts are disabled during installation. Its official wrapper downloads and checksum-verifies the platform binary on first use, requiring access to Snyk's download service. To initialize it explicitly, run `./node_modules/.bin/snyk --version`.

| Command | Purpose |
| --- | --- |
| `npm start --prefix sample -- 'Example onboarding'` | Run the sample checklist application. |
| `npm run doctor` | Inspect tools, manifest/dependency availability and credential presence; no security scan. |
| `npm run demo` | Reproduce and repair the missing-manifest error without Snyk authentication. |
| `npm run scan -- --approve-service-use` | Run a real sample scan after explicitly approving service use and dependency metadata transmission. |
| `npm run verify` | Check required files, package configuration, syntax, tests and evidence against the latest scan attempt. |
| `npm run report` | Rerun verification and generate docs/IMPLEMENTATION-HANDOVER.md and .json. |

Equivalent direct syntax is `node src/cli.js <command>`. `verify --approve-service-use` first performs a fresh real scan. Plain verify/report make no scan request. They accept only the latest attempt with a matching sample fingerprint, never an earlier green scan after a later failure. Local reports deliberately do not query GitHub: their hosted-CI NOT VERIFIED field is a tool limitation, not evidence that the separately linked hosted run failed. They return exit 2 while checks remain unverified.

For optional authentication, approve service use, then run `./node_modules/.bin/snyk auth` in your terminal before the consent-gated scan command. Secure `SNYK_TOKEN` or `SNYK_OAUTH_TOKEN` environment variables are supported. Doctor checks presence only and does not inspect local OAuth files. Never paste credentials into source or chat. Running scan without approval records a later blocked attempt and changes subsequent verification status.

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


## Evidence and workflow details
Events use timestamps, UUIDs and SHA-256 over redacted data. Real scan summaries include tool version, command, exit status, sample fingerprint and selected finding fields. Parser fixtures are test inputs, never real scanner evidence. Digests detect accidental edits, not malicious forgery. Only reviewed scan/exercise JSON events are tracked; other generated events, machine-readable handovers, caches, dependencies and auth/config files are excluded. Review all artifacts before sharing. The committed Markdown handover is a historical snapshot: copy it before regenerating if you need to preserve that snapshot locally.

The Local checks workflow runs installation, syntax, deterministic tests, sample tests and the manifest exercise on push/PR without Snyk credentials. The security workflow is manual, trusted-default-branch-only and uses environment snyk-security. Its SNYK_TOKEN is scoped to availability-check and scan steps; missing credentials yield NOT VERIFIED and failure. Checkout credentials are not persisted, permissions are contents: read, and actions are pinned. Detailed environment-secret configuration is retained in [the release audit](RELEASE-AUDIT.md#minimum-optional-hosted-snyk-configuration). Do not run secret-bearing workflows on untrusted pull-request code or switch them to pull_request_target. Hosted Snyk has not been performed.
