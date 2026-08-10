# Nolyvatix Maintainer Guide

This guide describes operational standards, repository workflows, release management protocols, and code review criteria for project maintainers of **Nolyvatix**.

---

## 👥 Maintainer Roles & Responsibilities

1. **Architecture Integrity**: Ensure new PRs do not violate the decoupled design pattern (UI presentation vs server services vs client repositories).
2. **Type Safety Enforcement**: Guarantee `npm run lint` (`tsc --noEmit`) passes with 0 errors on every PR.
3. **Automated Test Maintenance**: Ensure all 46 unit test cases pass before approving merges.
4. **Security Auditing**: Review external dependencies and input validation logic.
5. **Release Management**: Tag and publish semantic versions (`v1.0.0`, `v1.1.0`).

---

## 🔄 Release Management Workflow

Nolyvatix follows [Semantic Versioning 2.0.0](https://semver.org/).

### Creating a New Release

1. **Verify Development Branch**:
   Ensure `main` is clean, linted, and passing all tests:
   ```bash
   npm run lint
   npm test
   npm run build
   ```

2. **Update Version Number**:
   Update `version` in `package.json` and update `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/).

3. **Tag Git Release**:
   ```bash
   git tag -a v1.0.0 -m "Nolyvatix Version 1.0.0 GA Release"
   git push origin main --tags
   ```

4. **Publish GitHub Release**:
   Create a new GitHub release attached to tag `v1.0.0` using the release description template in `RELEASE_NOTES.md`.

---

## 🔍 Pull Request Review Checklist

When reviewing incoming pull requests, maintainers must verify:

- [ ] **TypeScript Strictness**: No implicit `any`, no casting hacks (`as any`), all DTOs typed in `src/types/index.ts`.
- [ ] **Service Isolation**: Business logic resides in `src/server/services/`, not inside Express routes or React components.
- [ ] **Response Envelopes**: Route responses use `sendSuccess` and `sendError` helpers from `src/server/middleware/responseWrapper.ts`.
- [ ] **Test Coverage**: New services or route methods must include unit test assertions in `src/server/__tests__/`.
- [ ] **UI Aesthetics**: Component additions adhere to the high-contrast *LumenIQ* glassmorphism design system.
- [ ] **No Regression**: `npm test`, `npm run lint`, and `npm run build` pass cleanly.

---

## 🔒 Security Response Policy

If a security vulnerability is reported via [SECURITY.md](SECURITY.md):

1. Maintainers acknowledge receipt within **24 hours**.
2. Investigation and triage must complete within **48 hours**.
3. Create a private patch branch (`fix/security-vulnerability-id`).
4. Apply fix, verify tests, and issue a patch release (`v1.0.1`).
