# ONBOARDKIT

**A local developer-tool implementation and verification workbench: check prerequisites → configure scanning → reproduce a failure → verify → hand over.**

ONBOARDKIT is a Node.js CLI for practising technical onboarding with an isolated npm sample. It is an independent, AI-assisted portfolio project, not work commissioned by Snyk or delivered to an enterprise customer.

## What it does

- Checks Node.js, npm, Git, scanner availability, the sample manifest and installed dependencies. Credential checks detect presence, not validity.
- Runs an explicitly approved Snyk Open Source scan against the sample.
- Reproduces a missing-manifest error, records the diagnostic, restores the manifest and verifies the correction.
- Records timestamped, redacted evidence with integrity hashes and generates Markdown/JSON implementation handovers.

## Run locally

Requires Node.js 22+, npm and Git on macOS or Linux, plus npm network access for installation. This demonstration needs no Snyk authentication:

```sh
git clone https://github.com/Parthhhhhh30/onboardkit.git
cd onboardkit
npm ci --ignore-scripts --no-audit --no-fund
npm ci --prefix sample --ignore-scripts --no-audit --no-fund
npm run check
npm test
npm test --prefix sample
npm run demo
```

Optional real scanning: first approve Snyk service use and transmission of the sample’s dependency metadata, then authenticate privately:

```sh
./node_modules/.bin/snyk auth
npm run scan -- --approve-service-use
```

First scanner use downloads its official binary; see [troubleshooting and command guidance](docs/TROUBLESHOOTING.md).

## Verification

[Hosted Local checks passed](https://github.com/Parthhhhhh30/onboardkit/actions/runs/43531269743): **27 workbench tests, 2 sample tests**, syntax checks and the controlled configuration-failure exercise. Automated checks are separate from the optional, manually triggered security workflow.

The [historical local Snyk record](evidence/2026-11-13T23-02-53.943Z-717189a9-0470-4ac9-ba13-968f9659fa18.json) reports **one npm dependency and zero reported vulnerabilities**. It retains a result summary, not raw stdout or a signed attestation; a clean sample scan does not demonstrate remediation or production security.

## Documentation and scope

See the [historical handover](docs/IMPLEMENTATION-HANDOVER.md), [evidence](EVIDENCE.md) and [demo walkthrough](docs/DEMO.md).

Scope is the isolated sample: no actual customer implementation, no verified remediation and no hosted Snyk scan yet.
