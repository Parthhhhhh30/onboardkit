# Final release plan

- Inspect historical scanner evidence, source, tests, dependencies, workflow trust and publication privacy.
- Correct misleading remediation PASS and stale documentation; add targeted regression coverage only.
- Run final tests, fresh lockfile installation, configuration and evidence/report consistency checks.
- Prepare a separate clean local public repository with an exact reviewed file/hash inventory. No remote creation or push.
- Stop implementation once sufficient evidence is recorded. Await explicit publication approval, owner and repository name before external writes.
- After publication authorization, push reviewed files, trigger/inspect real hosted Local checks run and report its actual terminal state. Hosted scanner run is separately gated on secure secret configuration.
