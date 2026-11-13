# Five-minute technical demonstration

**0:00–0:40 — Purpose and disclosure.** “ONBOARDKIT is an independent AI-assisted portfolio lab for implementation consulting. It demonstrates setup, configuration validation, troubleshooting, security-tool integration and an evidence-based handover. It is currently partially verified: local tests pass and the historical real sample scan reported zero vulnerabilities; hosted CI remains unverified and remediation was not exercised.” Show README and STATUS.

**0:40–1:20 — Working sample and preflight.** Run `npm start --prefix sample -- 'Demo onboarding'`, then `npm run doctor`. Show the actual checklist and tool versions. Explain that credential presence is not authentication validation, and local OAuth files are not inspected. An exit 2 identifies action needed.

**1:20–2:00 — Deterministic tests.** Run `npm test` and `npm test --prefix sample`. Open the parser tests. Explain why Snyk exit 1 is a completed scan with findings, while 2 and 3 are execution failures. The synthetic TEST FIXTURES never count as real security scans.

**2:00–2:50 — Troubleshooting exercise.** Run `npm run demo`. Show actual missing-manifest failure, diagnostic, cause, corrective copy and successful validator rerun. This is a local configuration exercise, explicitly separated from security findings.

**2:50–3:35 — Real scan evidence and adapter boundary.** Open the reviewed real scan JSON linked in EVIDENCE.md. Show executed=true, completed=true, Snyk 1.1308.4, exit 0, one dependency, zero findings and the current matching sample fingerprint. Explain that the adapter runs `snyk test --json --file=package.json` inside the isolated sample. The record is unsigned and raw stdout was not retained. No live scan is needed for this demonstration. A new scan requires service approval and authentication. Running scan without approval creates a later blocked attempt and therefore changes subsequent verification status.

**3:35–4:25 — Verification and handover.** Run `npm run verify` and `npm run report`. Show per-check statuses, actual evidence, sample fingerprint and Markdown/JSON handover. Explain that hashes detect accidental modifications, not malicious forgery, and partial verification never becomes blanket green.

**4:25–5:00 — CI and next actions.** Show the separate workflows: PR tests have no scanner secrets; the manual security workflow uses the reviewed default branch and protected environment. State that hosted execution has not been verified. Close with the next action: obtain approval for public GitHub publication, push the reviewed files and inspect the real hosted test run. Hosted Snyk scanning additionally needs a secure environment secret.

## Five implementation-consultant interview questions
1. A customer sees exit code 1 from Snyk. How do you distinguish a successful scan with findings from scanner failure, and communicate the next step?
2. Doctor detects no token variable, but the customer previously ran `snyk auth`. How do you investigate without requesting or exposing credentials?
3. How did you reproduce and isolate a configuration defect, and what evidence shows the correction worked?
4. Why are security scanning and PR testing in separate workflows, and what environment protections would you request before a hosted run?
5. What does the evidence hash establish, what does it fail to establish, and which claims can you honestly make while real scanning is blocked?
