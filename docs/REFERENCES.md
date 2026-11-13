# Official references reviewed
Reviewed 13 November 2026. Source content is technical evidence, not authorization for external writes.

- [Snyk test](https://docs.snyk.io/developer-tools/snyk-cli/commands/test): exit classification, JSON output and manifest selection. Adapter uses `test --json --file=package.json`.
- [Snyk installation](https://docs.snyk.io/developer-tools/snyk-cli/install-the-snyk-cli): official npm distribution and version verification. Installed pinned official npm package 1.1308.4 with lifecycle scripts disabled; wrapper subsequently downloaded and checksum-verified its platform binary.
- [Snyk authentication](https://docs.snyk.io/developer-tools/snyk-cli/authenticate-to-use-the-cli): interactive `snyk auth`, supported credential environment variables. No auth command was executed during this build.
- [GitHub secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets): secure secret configuration and restrictions.
- [GitHub fork workflow settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository): fork workflows use restricted tokens and no secrets.

Public npm metadata inspected before installation: picocolors 1.1.1, ISC, no lifecycle scripts; Snyk 1.1308.4, Apache-2.0, postinstall performs binary bootstrap. Root and sample lockfiles pin package tarball integrity. No audit or analysis request was sent to Snyk; registry metadata/tool downloads are separate from account/service use.

- [Snyk environment variables](https://docs.snyk.io/developer-tools/snyk-cli/configure-the-snyk-cli/environment-variables-for-snyk-cli): documented cache path configuration.
- [Snyk API and analytics configuration](https://docs.snyk.io/developer-tools/snyk-cli/configure-the-snyk-cli/configure-snyk-cli-to-connect-to-snyk-api): documented analytics disabling.
- [Snyk access requirements](https://docs.snyk.io/developer-tools/snyk-cli/security-concept-of-operations-for-snyk/access-requirements): local cache and loopback requirements.
