# Limitations and honest claims
- Overall status remains PARTIALLY VERIFIED: the recorded local sample scan passed, remediation was not exercised, and hosted CI is NOT VERIFIED until a genuine Actions run is reviewed.
- This is an independent AI-assisted sample, not paid client work, Snyk employment, a production rollout or independent manual authorship.
- Scope is one isolated npm sample. No production repositories are scanned. Only Snyk Open Source `test` is supported; no monitor, SAST, container or IaC scanning.
- An authenticated scan transmits dependency information to the Snyk service. Approval is per scan invocation. The reviewed historical scan record reports a successful execution at 23:02:53 UTC on 13 November 2026. The final release audit made no further scan request.
- Doctor checks environment credential presence only, and leaves local OAuth state unknown. A successful scan records usable authentication at its execution time; it does not prove current access. No credentials are persisted by ONBOARDKIT; official Snyk authentication is managed by Snyk itself.
- The CLI requires Node 22+ and is exercised on macOS; Linux is configured in hosted CI but has not been run here. Windows support is not claimed.
- SHA-256 evidence checks detect accidental edits, not hostile forgery. Evidence is local and unsigned. Scan fingerprints cover sample app, manifest and lockfile; they do not prove dependency files on disk, Snyk policy state or the entire repo are unchanged. Rerun scanning after changes or for current assurance.
- Latest scan evidence is a historical observation and has no automatic expiry. Account access and vulnerability intelligence may change. A prior scan is not proof of present security.
- Unit fixtures verify parser behavior, not Snyk service behavior. Parser is deliberately strict for one npm JSON response and fails closed on schema changes.
- Reports retain selected finding fields; they are not complete raw scanner archives. Redaction reduces credential exposure but cannot identify every possible sensitive free-text value; review before sharing. No environment dump, auth files or tokens are saved.
- Hosted status is deliberately never inferred from YAML inspection. A successful local check does not verify GitHub access, environment settings or cloud execution.
- No claim of remediation, compliance, exploitability, business outcomes or production readiness is made.

- The historical record contains a selected result summary, not raw Snyk stdout, a signed scanner attestation or the full process environment. Source inspection confirms the intended real process path and sample target; stored metadata, matching sample fingerprint and installed binary checksum are consistent with that execution. They cannot independently prove the original stdout producer or exclude a historical executable override.
- Zero sample findings are not evidence that a vulnerability was remediated. Remediation remains NOT VERIFIED. Root scanner tooling and transitive dev dependencies were not security-scanned by the sample-only command.
