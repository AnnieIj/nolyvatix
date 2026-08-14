# Contributing to Nolyvatix

First off, thank you for considering contributing to **Nolyvatix**! 🎉
Nolyvatix is an open-source, enterprise-grade Business Intelligence platform built for the Stellar blockchain ecosystem.

Whether you're fixing a bug, adding a new Soroban contract decoder feature, improving documentation, or creating new dashboard visualizations, your help is welcome!

---

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
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
   Add your keys (e.g. `GEMINI_API_KEY` for AI features, or custom Horizon/Soroban RPC endpoints).

4. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Run Typechecks and Linting**:
   ```bash
   npm run lint
   ```

---

## 📐 Coding Standards & Guidelines

- **TypeScript**: Strict mode is enabled. All functions, components, props, and API state payloads must be explicitly typed (`/src/types/index.ts`). Avoid `any`.
- **Styling**: Use **Tailwind CSS v4** utility classes. Do not write inline styles or standard CSS files.
- **Icons**: Always import icons from `lucide-react`.
- **State Management**: Use Zustand (`/src/store/useAppStore.ts`) for global application state and TanStack Query (`/src/services/queryClient.ts`) for asynchronous API data fetching.
- **Component Design**: Keep UI modular and accessible. Follow the atomic design structure in `/src/components/`.

---

## 🌿 Branch Naming Convention

Use clear, structured branch names:

- `feat/feature-name` (e.g., `feat/soroban-event-parser`)
- `fix/bug-description` (e.g., `fix/horizon-sse-reconnect`)
- `docs/topic-name` (e.g., `docs/architecture-update`)
- `refactor/component-name` (e.g., `refactor/chart-container`)
- `chore/task-description` (e.g., `chore/bump-deps`)

---

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat: add Soroban WASM instruction counter widget`
- `fix: resolve stale connection in Horizon ledger stream`
- `docs: update deployment instructions in README`
- `style: refine glassmorphic card contrast ratios`
- `refactor: extract status chip component to UI design system`
- `test: add unit tests for utility number formatters`

---

## 🔄 Pull Request Process

1. **Create an Issue**: Before starting major work, create an issue or comment on an existing issue to discuss your planned changes.
2. **Branch from `main`**: Ensure your feature branch is created from the latest `main`.
3. **Commit Your Changes**: Follow commit conventions.
4. **Run Verification**:
   ```bash
   npm run lint
   npm run build
   ```
5. **Submit PR**: Fill out the Pull Request template completely. Link the relevant issue number (e.g., `Closes #42`).
6. **Code Review**: A maintainer will review your code. Address any feedback promptly.

---

## 🐛 Issue Reporting

When reporting a bug, please use the **Bug Report** issue template and include:
- A clear, descriptive title.
- Steps to reproduce the behavior.
- Expected vs actual result.
- Browser/OS details and console error logs.

---

## 🔍 Code Review Guidelines

Maintainers look for:
1. **Adherence to Type Safety**: No implicit `any` or missing interfaces.
2. **Performance**: Efficient re-rendering, proper memoization or query caching.
3. **Security**: Server-side proxying for sensitive API keys.
4. **UI Consistency**: Alignment with Nolyvatix / LumenIQ design tokens.
