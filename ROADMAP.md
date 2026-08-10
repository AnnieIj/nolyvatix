# Nolyvatix Platform Roadmap

This document outlines the development roadmap for **Nolyvatix**, the open-source Business Intelligence & Analytics platform for the Stellar blockchain ecosystem and Soroban WASM smart contracts.

---

## 🎯 Phase 1: Core BI & Real-Time Engine (Released in v1.0.0)

- [x] **Core UI & Design Tokens**: Enterprise LumenIQ dark design system with Tailwind CSS v4 and glassmorphism card wrappers.
- [x] **Real-Time Command Center**:
  - Horizon REST SSE live ledger stream listener.
  - Network throughput (TPS) time-series monitoring.
  - Average ledger close speed telemetry.
- [x] **State Engine & Query Layer**:
  - Zustand global state for theme, network selection (Mainnet/Testnet), and wallet state.
  - `@tanstack/react-query` configured with stale caching for live sync.
- [x] **Web3 Wallet Connection**:
  - Browser extension wallet integration (Freighter, Albedo).
- [x] **Gemini AI Copilot**:
  - Server-side integration with `@google/genai` (Gemini 2.5 Flash).
  - Natural language telemetry queries to dynamic Recharts graphs.

---

## 🚀 Phase 2: Enterprise Analytics & Collaboration (Released in v1.0.0)

- [x] **Enterprise Dashboard Builder**:
  - Drag-and-drop 12-column grid layout builder.
  - Custom metric widgets, layout persistence, widget duplication, and entity pinning.
- [x] **BI Reporting Engine**:
  - Automated executive, technical, and compliance report generation.
  - Multi-format report export pipeline for `JSON`, `CSV`, and `Markdown`.
- [x] **Enterprise Alerts & Webhooks**:
  - Multi-channel dispatchers (Browser, Email, Webhooks, Slack, Discord).
  - Anomaly triggers for TPS drops, whale transfers (> 1M XLM), trustline spikes, DEX volume surges, liquidity TVL drops, and Soroban WASM contract execution failures.
  - Per-trigger history log tracking, severity levels (`info`, `warning`, `critical`), single/bulk event acknowledgment, and global alert stats.
- [x] **Search Intelligence**:
  - Universal search engine querying accounts, contracts, ledgers, transactions, assets, pools, dashboards, reports, and alert rules.
  - Automatic query persistence to workspace search history.
- [x] **Multi-Workspace Hub & Collaboration**:
  - Multi-workspace management with role-based permission controls (`owner`, `editor`, `viewer`).
  - Shareable read-only link generation (`/api/workspaces/:id/share`) with security tokens.
  - Bookmarking for pinned assets, wallets, contracts, and saved AI chat threads.
- [x] **Unified Export Center**:
  - Data package exporter supporting PDF, CSV, JSON, Markdown, PNG, and SVG vector charts.

---

## 🔮 Phase 3: Future Explorations & Community Requests (Post v1.0.0)

- [ ] **Persistent Database Adapters**: PostgreSQL & Redis adapters for distributed multi-instance deployment clusters.
- [ ] **Self-Hosted Kubernetes Deployments**: One-click Helm charts for enterprise infrastructure.
- [ ] **OpenAPI / Swagger Interactive Specs**: Interactive Swagger UI mounted on `/api/docs`.
- [ ] **Mobile Responsive PWA / Native Client**: Mobile-optimized telemetry dashboard.
