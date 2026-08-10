# Release Notes — Nolyvatix Version 1.0.0

**Release Date:** August 10, 2026  
**Tag / Release Version:** `v1.0.0`  
**License:** MIT License  

We are thrilled to announce the official **v1.0.0 General Availability (GA) release** of **Nolyvatix**, the open-source Business Intelligence (BI), observability, and analytics engine for the Stellar blockchain ecosystem and Soroban WASM smart contracts.

---

## 🌟 Major Highlights & Feature Modules

### 1. Real-Time Command Center
- Low-latency Horizon REST SSE stream monitoring for live ledger block closes, base fees, and TPS throughput graphs.
- One-click network switcher for Stellar `Mainnet` and `Testnet`.

### 2. Enterprise Dashboard Builder
- Interactive 12-column drag-and-drop grid layout workspace.
- Dynamic widget resizing, repositioning, widget duplication, custom metrics settings, entity pinning, and layout persistence.

### 3. BI Reporting Engine
- Daily, Weekly, Monthly, and Custom BI executive report generation.
- Automated KPI extraction, network health synthesis, and multi-format exports (`JSON`, `CSV`, `Markdown`).

### 4. Enterprise Alerts & Notification Engine
- Threshold monitoring for TPS drops, whale transfers (> 1M XLM), trustline spikes, DEX volume surges, liquidity pool TVL drops, and Soroban WASM contract execution failures.
- Multi-channel dispatch integration: Browser, Email, Webhooks, Slack, and Discord.
- Per-trigger history log tracking with severity classification (`info`, `warning`, `critical`), single/bulk event acknowledgment, test payload dispatch, and global alert statistics.

### 5. Search Intelligence & History
- Universal search engine matching Stellar public keys (`G...`), Soroban contract IDs (`C...`), ledger sequences, transaction hashes, assets, AMM liquidity pools, dashboards, reports, and alert rules.
- Automatic query logging to active workspace search history with clear history options.

### 6. Workspace Management & Collaboration
- Named multi-workspace creation, updating, deletion, and active workspace switching.
- Role-based permission controls (`owner`, `editor`, `viewer`).
- Shareable read-only link generation (`/api/workspaces/:id/share`) with security tokens and viewer role degradation.
- Bookmarking for pinned assets, wallets, contracts, and saved Gemini AI Copilot conversation threads.

### 7. Unified Export Center
- Data export center supporting PDF, CSV, JSON, Markdown, PNG, and SVG vector chart packages across network telemetry, Soroban WASM contract performance, liquidity pools, and AI digests.

### 8. Gemini AI Copilot Integration
- Server-side integration with Google Gemini AI (`@google/genai`) for natural language telemetry querying, autonomous WASM gas/CPU execution anomaly detection, and dynamic Recharts layout synthesis.

---

## 🛠️ Technical Highlights & Architecture

- **Full-Stack Decoupled Architecture**: React 19 frontend with Zustand store and TanStack React Query, backed by Node.js Express server (`esbuild` bundled to `dist/server.cjs`).
- **Dependency Injection**: Modular DI container (`initializeDataEngine`) powering 15 Express API routers.
- **Type Safety**: Strict TypeScript configuration with **0 compilation errors**.
- **Automated Test Coverage**: 46 unit test cases passing across 10 test suites covering all services, repositories, RPC clients, and caches.
- **Styling System**: Enterprise *LumenIQ* glassmorphism design system built with Tailwind CSS v4 and Lucide React icons.

---

## ⚠️ Breaking Changes

- None. Version 1.0.0 establishes the baseline stable public API contract for all `/api/*` endpoints.

---

## 🔒 Known Limitations & Recommendations

- **Persistence Layer**: Default repository implementations store workspace metadata, custom dashboards, and alert rules in memory. For multi-instance horizontal cluster deployments, plug in an external database adapter (e.g. PostgreSQL / Redis).
- **Gemini API Key**: If `GEMINI_API_KEY` is omitted, the AI Copilot operates in deterministic rule engine fallback mode.

---

## 📦 Installation & Upgrade Notes

To deploy Version 1.0.0 locally or in production:

```bash
git clone https://github.com/nolyvatix/nolyvatix.git
cd nolyvatix
npm install
cp .env.example .env
npm run build
npm start
```

Server starts on **`http://localhost:3000`**.
