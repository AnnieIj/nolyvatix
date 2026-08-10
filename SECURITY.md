# Security Policy

The Nolyvatix maintainers take the security of our platform and ecosystem seriously. We appreciate the efforts of security researchers and open-source contributors who help us maintain high standards of security and reliability.

## Supported Versions

Only the latest release and the current `main` branch receive security updates and patches.

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a potential security vulnerability in Nolyvatix (e.g., sensitive credential leaks, API key exposure, authentication bypasses, cross-site scripting, or Soroban contract RPC event spoofing):

1. **Email Vulnerability Report**: Send a detailed report to [security@nolyvatix.org](mailto:security@nolyvatix.org).
2. **Report Contents**:
   - Description of the vulnerability and its potential impact.
   - Step-by-step instructions or proof-of-concept (PoC) code to reproduce the issue.
   - Affected components, files, or endpoints.
   - Any proposed remediation or patch if available.

### Responsible Disclosure Timeline

- **Acknowledgement**: We will acknowledge receipt of your vulnerability report within 24–48 hours.
- **Assessment**: Our security team will validate the issue and assess its severity according to CVSS v3.1 standards within 5 business days.
- **Fix & Patch**: A fix will be developed, tested, and released in a security advisory release within 14 business days for critical/high vulnerabilities.
- **Public Disclosure**: Once the fix is published, we will credit the reporter (if desired) in the release notes and advisory.

## Security Practices in Nolyvatix

- **API Secrets**: All API keys (e.g., Gemini API keys, custom RPC endpoints) are strictly proxies through server-side routes and never exposed to client-side bundles.
- **Dependency Audits**: Automated dependency scanning is enabled via GitHub Dependabot and `npm audit`.
- **Sanitisation**: All user inputs, ledger sequence inputs, and smart contract decoded logs are sanitized before rendering.
