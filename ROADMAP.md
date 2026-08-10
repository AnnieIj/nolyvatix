# Nolyvatix Platform Roadmap

This document outlines the multi-phase development roadmap for **Nolyvatix**, the open-source Business Intelligence & Analytics platform for the Stellar blockchain ecosystem.

---

## 🎯 Phase 1: Sprint 1 MVP Foundation (Current Release)

- [x] **Core UI & Token System**: Enterprise LumenIQ / Nolyvatix dark design system with Tailwind CSS v4 and glassmorphic overlays.
- [x] **Real-Time Command Center**:
  - Horizon REST SSE live ledger stream listener.
  - Network throughput (TPS) time-series monitoring.
  - Average ledger close speed telemetry.
- [x] **State Engine & Query Layer**:
  - Zustand global state for theme, network selection (Mainnet/Testnet), and wallet state.
  - `@tanstack/react-query` configured with 5-second stale caching for live sync.
- [x] **Web3 Wallet Connection**:
  - Stellar browser wallet modal integration (Freighter, Albedo).
- [x] **Gemini AI Co-Pilot Drawer**:
  - Server-side proxy integration with `@google/genai`.
  - Natural language query to dynamically rendered Recharts graphs.

---

## 🚀 Phase 2: Version 1.0 (Upcoming Production Release)

Target: Q3 2026

- [ ] **Soroban WASM APM & Profiler**:
  - Contract inspection by address (`C...`).
  - CPU instruction cycles & memory footprint usage graphs.
  - Real-time WASM event topic log decoder.
- [ ] **Assets & Anchor Corridors**:
  - Cross-border remittance velocity map (USDC, EURC).
  - AMM liquidity pool TVL & impermanent loss calculators.
- [ ] **Database & Workspace Persistence**:
  - Integration with PostgreSQL via Drizzle ORM for user account preferences and saved views.
- [ ] **Data Export Pipelines**:
  - One-click CSV and JSON exports for all table views.
  - PDF report generator for executive digests.

---

## ⚡ Phase 3: Version 2.0 (Enterprise Scaling & Automated Alerting)

Target: Q4 2026

- [ ] **Drag-and-Drop BI Dashboard Builder**:
  - Responsive 12-column widget grid builder.
  - Custom metric widgets, heatmaps, and sankey flow diagrams.
- [ ] **Real-Time Alerting Engine**:
  - Webhook dispatchers for Discord, Slack, and Telegram.
  - Anomaly triggers for TPS drops, gas fee spikes, or contract execution failures.
- [ ] **Multi-Tenant Team Workspace**:
  - Role-based access control (RBAC) for institutional analytics teams.
  - Shareable public dashboard links with password protection.

---

## 🔮 Phase 4: Future Explorations & Community Requests

- [ ] **Self-Hosted Docker & Kubernetes Deployments**: One-click Helm charts for enterprise deployments.
- [ ] **AI Anomaly Root-Cause Engine**: Autonomous agentic analysis of failed Soroban invocations.
- [ ] **Mobile Responsive Native App / PWA**: Mobile-optimized telemetry dashboard.
