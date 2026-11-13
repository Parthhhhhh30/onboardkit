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
