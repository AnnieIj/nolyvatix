# Changelog

All notable changes to the **Nolyvatix** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-10

### Added
- **Enterprise Dashboard Builder**:
  - Drag-and-drop 12-column BI widget layout grid.
  - Widget resizing, repositioning, duplication, entity pinning, and workspace layout persistence.
- **BI Reporting Engine**:
  - Automated executive, technical, and compliance report generator.
  - Multi-format report export pipeline for `JSON`, `CSV`, and `Markdown`.
- **Enterprise Alerts & Webhook Engine**:
  - Real-time threshold monitoring for TPS drops, whale transfers (> 1M XLM), trustline spikes, DEX volume surges, liquidity TVL drops, and Soroban WASM failures.
  - Multi-channel notification dispatchers (Browser, Email, Webhooks, Slack, Discord).
  - Event log history with severity tracking (`info`, `warning`, `critical`), single/bulk event acknowledgment, test payload dispatch, and global alert statistics.
- **Search Intelligence**:
  - Universal search engine querying accounts (`G...`), Soroban contracts (`C...`), ledgers, transactions, assets, AMM liquidity pools, dashboards, reports, and alert rules.
  - Automatic query persistence to workspace search history with clear history options.
- **Workspace Management & Collaboration**:
  - Multi-workspace creation, updating, deletion, and active workspace switching.
  - Role-based permission controls (`owner`, `editor`, `viewer`).
  - Shareable read-only link generation (`/api/workspaces/:id/share`) with security tokens and viewer role degradation.
  - Bookmarking for pinned assets, wallets, contracts, and saved Gemini AI Copilot conversation threads.
- **Unified Export Center**:
  - Data package exporter supporting PDF, CSV, JSON, Markdown, PNG, and SVG vector charts.
- **Verification Suite & Test Coverage**:
  - 46 unit test cases passing across 10 test suites covering all core services, repositories, RPC clients, and caches.
  - Clean TypeScript build with 0 compilation errors.

---

## [0.1.0] - 2026-08-10

### Added
- **Sprint 1 Core Architecture**: React 19, TypeScript, Vite, Tailwind CSS v4, and `@tanstack/react-query` foundation.
- **LumenIQ Enterprise Design Tokens**: High-contrast dark theme canvas, glassmorphism card wrappers, status chips, and typography hierarchy.
- **Real-time Command Center View**:
  - Live ledger close sequence stream listener via Horizon REST SSE.
  - TPS time-series graph rendered with Recharts.
- **Stellar Web3 Wallet Modal**: Connection state support for Freighter and Albedo.
