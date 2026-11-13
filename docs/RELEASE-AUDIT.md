# Final release audit

Audit date: 13 November 2026 (UTC). Independent review pass by the implementation agent, not independent human certification. Scope: existing ONBOARDKIT only; no redesign, new feature, new scan, external repository creation, push or hosted run.

## Findings and corrections
1. **Misleading remediation PASS (corrected).** A clean scan does not establish remediation. The check now reports NOT VERIFIED and explicitly states that no remediation was required or performed. Regression coverage exercises clean scans, reported findings and missing scan evidence, and checks the generated handover wording.
2. **Insufficient scan-record acceptance checks (corrected).** Verification now requires executed=true, completed=true, matching sample fingerprint, real adapter origin and consistent scanner exit/status/finding metadata. Regression tests reject unexecuted, missing-exit, failure-exit and contradictory records.
3. **Stale documentation (corrected).** README, STATUS, EVIDENCE, limitations and demo now acknowledge the historical real scan; they no longer describe scanning as currently blocked. The historical presence-only doctor result is labeled as historical in reports. It is not evidence that later authentication failed.
4. **Publication privacy (addressed).** The publication candidate is a separate local repository. Only the original reviewed real-scan event and configuration-exercise event are allowlisted. Dependencies, tool caches, credentials, local configuration, full local verification history and machine-readable generated handovers are excluded. The reviewed Markdown handover is a historical snapshot.

## Independently inspected real scan record
- Timestamp: 2026-11-13T23:02:53.943Z; event ID 717189a9-0470-4ac9-ba13-968f9659fa18.
- Executed=true, completed=true, origin=REAL ADAPTER, official CLI version 1.1308.4.
- Command `snyk test --json --file=package.json`; inspected adapter cwd is `sample/`; the manifest identifies onboardkit-safe-sample 1.0.0.
- Exit code 0, npm, one dependency, zero findings. PASS means no vulnerabilities reported by that scan, not remediation or proof of security.
- Current sample hash matches `73d057b211c4f343e5235041902450a4cb7c707d7f23bb36ef5fc379a9a82133`.
- Event SHA-256 integrity passed. Installed platform binary checksum matches the checksum shipped with pinned Snyk 1.1308.4; binary SHA-256 `dfb90210c5fb7d22e163b6518ed35c3634f6e5903932ef51096c3d768cac8f74`.
- Source invocation uses spawnSync without a shell and targets only the isolated sample. Parser fixture tests never write real scan evidence.
- **Provenance limit:** original raw stdout, complete execution environment and signed attestation were not retained. The existing record, source and binary are consistent with real execution. The audit cannot independently authenticate the historical stdout producer or exclude a historical local executable override. Original events are retained unchanged, including the earlier misleading verification events in the private working directory. No fresh authenticated scan was performed in this audit.

## Pre-publication checks
| Area | Actual result |
| --- | --- |
| Source and configuration | Reviewed CLI, subprocess boundaries, sample, validation, evidence, redaction and handover generation. No runtime AI component or unrelated change introduced. |
| Dependencies and locks | Root Snyk pinned 1.1308.4; sample picocolors pinned 1.1.1. Both lockfile identity/dependency checks PASS. Fresh npm ci for both succeeded with scripts disabled, from cached official tarballs. No dependency changes. |
| Local automated tests | 27 workbench tests PASS; 2 sample tests PASS; no failures/skips. Syntax PASS. Final clean publication-directory verification reruns these tests. |
| Coverage | Node test coverage reported 71.19% lines, 88.30% branches, 83.78% functions for workbench test processes. Coverage is not 100%: approved live scan execution is not deterministically unit-tested; actual CLI demo/verify/report are also exercised separately. No claim of exhaustive coverage. |
| Workflow security | Both YAML files parsed. contents: read; full action commit pins; checkout persist-credentials false. PR/push checks contain no scanner secret. Security workflow is manual, default-branch-only, uses snyk-security environment; token scoped to availability and approved scan steps. Environment controls must be configured on GitHub. |
| Failure exercise | Actual missing-manifest failure exit 1 and corrected rerun exit 0; historical event inspected and local demo rerun. No exploitable dependency used. |
| Evidence and reports | Original record hashes checked; sample fingerprint matches; report preserves real scan PASS, remediation NOT VERIFIED and hosted CI NOT VERIFIED. Local unsigned hashes detect edits, not hostile forgery. |
| Privacy | Exact publication file list reviewed; known credential environment values and common token/private-key patterns checked without printing credentials. No auth/config/cache files or local absolute user paths are included. This is a scoped secret check, not a universal proof of absence. |
| Hosted execution | NOT VERIFIED. YAML parsing, local tests and source review do not prove Actions execution. No remote URL or hosted run URL exists yet. |

## Exact local validation commands
In both existing and clean publication directories as appropriate:

```sh
npm ci --ignore-scripts --no-audit --no-fund --offline --cache /tmp/onboardkit-npm-cache
npm ci --prefix sample --ignore-scripts --no-audit --no-fund --offline --cache /tmp/onboardkit-npm-cache
npm run check
npm test
npm test --prefix sample
node --test --experimental-test-coverage test/core.test.js
npm run demo
npm run verify
npm run report
```

Verify/report exit 2 is expected: hosted CI and remediation remain NOT VERIFIED. This does not erase the historical real-scan PASS. Workflow YAML was also parsed with Ruby's standard YAML library and its permissions, trigger trust boundaries and full action pins asserted locally.

## Publication candidate and approval boundary
The clean local repository uses branch main and has no remote, commit or publication. PUBLICATION-MANIFEST.sha256 lists exact candidate file hashes except itself. Staged content is reviewed; caches, installed packages, auth/config material and non-allowlisted generated events are ignored. The release ZIP contains exactly the staged files. It is not the private development directory or its full history.

**Approval required:** authorize creation of a public GitHub repository, specify owner/name (suggested name onboardkit), and authorize pushing this reviewed snapshot and running the secret-free Local checks workflow. After approval, commit with an appropriate author identity, create the remote, push main, trigger/inspect the actual hosted run and report its terminal status. Any later source change requires revalidation before publication. No hosted success is claimed in advance.

## Minimum optional hosted Snyk configuration
No scanner secret is needed for the Local checks workflow. To authorize the separate real security workflow:
1. Configure GitHub environment snyk-security. Restrict deployment branches to the reviewed default branch; require a reviewer where available.
2. Add an authorized Snyk credential as environment secret SNYK_TOKEN through GitHub's secure UI. Do not paste it into chat or repository files. Ensure the credential can test the intended Snyk organization.
3. Approve service use, then manually dispatch Approved real security scan on the reviewed default branch. Inspect its actual logs and terminal result. Missing secret produces NOT VERIFIED and job failure; findings also produce a nonzero result, not a fake clean scan.
4. Never run secret-bearing workflows on untrusted PR code or change the event to pull_request_target. Review workflow/code changes before environment approval.

Official references: [Snyk test exit semantics](https://docs.snyk.io/developer-tools/snyk-cli/commands/test), [GitHub secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets), [workflow dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch).

## Remaining limits and release conclusion
The sample scan covers one npm dependency, not scanner tooling/transitive dev dependencies, SAST, production, compliance or exploitability. No remediation was exercised. Current authentication is not checked by this historical audit. Hosted CI is pending actual publication/run review. Within the local reviewed scope, material accuracy defects were fixed and no unresolved critical defect was identified. Ready for publication approval and an honest independent AI-assisted portfolio description. Stop development pending that approval.
