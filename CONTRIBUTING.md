# Contributing to Nolyvatix

First off, thank you for considering contributing to **Nolyvatix**! 🎉  
Nolyvatix is an open-source Business Intelligence & Analytics platform built for the Stellar blockchain ecosystem and Soroban WASM smart contracts.

Whether you are fixing a bug, writing unit tests, improving documentation, or creating new analytical views, your help is welcome!

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Git**

### Installation Steps

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nolyvatix.git
   cd nolyvatix
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your keys (e.g. `GEMINI_API_KEY` for AI Copilot features).

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Run Verification Suite**:
   ```bash
   npm run lint       # Runs TypeScript typecheck (tsc --noEmit)
   npm test           # Runs full 46-test unit suite (tsx --test)
   npm run build      # Builds Vite frontend + esbuild server bundle
   ```

---

## 📐 Coding Standards & Guidelines

- **TypeScript**: Strict mode enabled. All functions, components, services, and DTOs must be explicitly typed in `src/types/index.ts`. Avoid `any`.
- **Architecture**:
  - Presentation components live in `src/views/` and `src/components/`.
  - Service logic lives in `src/server/services/`.
  - Data clients live in `src/server/clients/` and `src/server/repositories/`.
  - Express routes live in `src/server/routes/`.
- **Response Wrapper**: All API controllers must use `sendSuccess(res, data)` or `sendError(res, message, status)`.
- **Styling**: Tailwind CSS v4 utility classes + Lucide React icons.
- **State Management**: Zustand (`src/store/useAppStore.ts`).

---

## 🌿 Branch & Commit Conventions

### Branch Naming
- `feat/feature-name` (e.g. `feat/soroban-event-filter`)
- `fix/bug-description` (e.g. `fix/horizon-rate-limit`)
- `docs/topic-name` (e.g. `docs/api-guide`)
- `test/test-description` (e.g. `test/alert-history`)

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add alert history event log viewer`
- `fix: correct parameter ordering in responseWrapper`
- `docs: update API endpoints in README`
- `test: add unit tests for WorkspaceService`

---

## 🔄 Pull Request Process

1. **Create an Issue**: Discuss planned changes before submitting major PRs.
2. **Branch from `main`**: Ensure your branch is rebased on latest `main`.
3. **Run Verification**: Ensure `npm run lint`, `npm test`, and `npm run build` all pass cleanly with 0 errors.
4. **Submit PR**: Fill out the PR template completely and tag relevant issues.
5. **Code Review**: A maintainer will review your submission promptly.
