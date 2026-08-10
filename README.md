# Nolyvatix — Open-Source Stellar & Soroban BI & Analytics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/nolyvatix/nolyvatix)
[![Tests](https://img.shields.io/badge/Tests-46%2F46%20Passing-brightgreen)](https://github.com/nolyvatix/nolyvatix)
[![React](https://img.shields.io/badge/React-19.0-sky)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-38bdf8)](https://tailwindcss.com/)
[![Stellar](https://img.shields.io/badge/Stellar-Horizon%20%2F%20Soroban-007afe)](https://stellar.org/)

**Nolyvatix** is an enterprise-grade, open-source Business Intelligence (BI), observability, and analytics platform designed specifically for the **Stellar blockchain ecosystem** and **Soroban WASM smart contracts**.

The platform ingests real-time Stellar Horizon REST events, ledger closed sequences, payment corridor telemetry, liquidity pool metrics, and Soroban JSON-RPC contract invocation data. It synthesizes complex blockchain telemetry into customizable BI dashboards, natural language AI copilot insights, multi-channel alerting, universal search intelligence, and multi-format data exports.

---

## 🌟 Key Features & Functional Modules

### ⚡ Real-Time Command Center
- **Live Ledger Telemetry**: Real-time throughput (TPS), ledger sequence tracking, block close speeds, fee pools, and operation volume graphs.
- **Stellar Network Switcher**: Low-latency switching between Stellar `Mainnet` (`https://horizon.stellar.org`) and `Testnet` environments.

### 📊 Enterprise Dashboard Builder
- **Dynamic Grid Layout**: 12-column drag-and-drop grid workspace supporting custom KPI cards, time-series charts, and telemetry tables.
- **Persistence & Duplication**: Workspace layout persistence, widget customization, layout duplication, and entity pinning.

### 📝 BI Reporting Engine
- **Automated Digest Generation**: Executive, technical, and compliance BI summaries for daily and weekly network activity.
- **Multi-Format Package Exports**: Instant export to `JSON`, `CSV`, and `Markdown` packages.

### 🔔 Enterprise Alerts & Webhook Center
- **Threshold Triggers**: Automated rules for TPS drops, whale transfers (> 1M XLM), trustline spikes, DEX volume surges, liquidity drops, and Soroban WASM failures.
- **Multi-Channel Dispatch**: Browser notifications, Email, Webhooks, Slack, and Discord.
- **Event Log History**: Severity tracking (`info`, `warning`, `critical`), single/bulk event acknowledgment, test payload dispatch, and global stats.

### 🔍 Search Intelligence
- **Universal Search Engine**: Unified search matching Stellar public keys (`G...`), Soroban contracts (`C...`), ledger sequences, transaction hashes, assets, AMM liquidity pools, dashboards, reports, and alert rules.
- **Search History**: Automatic query logging to active workspace history.

### 💼 Workspace Management & Collaboration
- **Multi-Workspace Hub**: Create and switch named workspaces with role-based access (`owner`, `editor`, `viewer`).
- **Shareable Read-Only Links**: Tokenized shareable URLs (`/api/workspaces/:id/share`) with role degradation for viewers.
- **Entity Pinning & AI Thread Saving**: Bookmark favorite dashboards, assets, wallets, contracts, and Gemini AI copilot conversation threads.

### 📦 Unified Export Center
- **Multi-Format Exports**: PDF, CSV, JSON, Markdown, PNG, and SVG vector chart exports for network telemetry, Soroban WASM performance, liquidity pools, and AI digests.

### 🔮 Gemini AI Copilot
- **Natural Language Telemetry Queries**: Natural language interaction with Stellar network data powered by Google Gemini AI (`@google/genai`).
- **WASM Gas & Execution Profiling**: Autonomous anomaly detection and dynamic Recharts generation.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Browser Frontend (React 19)                        │
│             Command Center │ Dashboard Builder │ Report Builder             │
│             Alert Center   │ Workspace Hub     │ Search & Export            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────┴──────────────────────────────────────┐
│                        Zustand Store & Router Layer                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP API Router (/api)
┌──────────────────────────────────────┴──────────────────────────────────────┐
│                    Express Backend & Data Engine Container                   │
│  ┌────────────────────┬────────────────────┬─────────────────────────────┐  │
│  │ Horizon Client     │ Soroban Client     │ MemoryCache                 │  │
│  ├────────────────────┼────────────────────┼─────────────────────────────┤  │
│  │ Repositories       │ Services           │ Middleware / Error Handler  │  │
│  └────────────────────┴────────────────────┴─────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────┴──────────────────────────────────────┐
│                           External Network Clients                          │
│     Horizon REST Nodes    │   Soroban JSON-RPC   │   Google Gemini API      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Project Structure

```
nolyvatix/
├── src/
│   ├── components/           # UI Components & Design System
│   │   ├── ui/               # GlassCard, Button, Badge, Modal, Navbar
│   │   └── ...
│   ├── server/               # Backend Express Server & Data Engine
│   │   ├── clients/          # HorizonClient, SorobanClient
│   │   ├── cache/            # MemoryCache
│   │   ├── repositories/     # LedgerRepo, TxRepo, AssetRepo, SorobanRepo
│   │   ├── services/         # Dashboard, Report, Alert, Search, Workspace
│   │   ├── routes/           # Express Routers (/api/*)
│   │   ├── middleware/       # ResponseWrapper & Error Handler
│   │   ├── __tests__/        # Node.js Test Suites (46/46 passing)
│   │   └── dataEngine.ts     # Dependency Injection Container
│   ├── store/                # Zustand State Store (useAppStore)
│   ├── types/                # TypeScript Interfaces & Types
│   ├── views/                # Top-level Application Views (13 views)
│   └── main.tsx              # React Root Initializer
├── dist/                     # Production Bundled Build Output
├── docs/                     # Technical Docs (PRD, Architecture, Deployment)
├── server.ts                 # Main Express Server Entrypoint
├── package.json              # Dependencies & Scripts
├── tsconfig.json             # TypeScript Strict Configuration
└── vite.config.ts            # Vite Build Configuration
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nolyvatix/nolyvatix.git
   cd nolyvatix
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key if AI Copilot features are enabled:
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:3000`** in your browser.

---

## 🧪 Testing & Verification

Nolyvatix includes an extensive unit test suite executing via Node.js native test runner (`node:test`):

```bash
# Run all server & service unit tests
npm test

# Run TypeScript type check
npm run lint

# Build production bundle
npm run build
```

### Verification Pipeline Status
- **Unit Tests**: 46 / 46 Passing (10 Test Suites)
- **TypeScript Check**: 0 Compilation Errors
- **Production Build**: Clean bundle compilation (`dist/index.html`, `dist/server.cjs`)

---

## 📡 REST API Route Overview

Nolyvatix exposes a structured REST API mounted on `/api`:

| Endpoint Router | Path | Description |
| :--- | :--- | :--- |
| **Network** | `/api/network` | Health telemetry, horizon status, soroban status, TPS. |
| **Ledgers** | `/api/ledgers` | Ledger headers, close sequence history, and metrics. |
| **Transactions** | `/api/transactions` | Settlement transactions and operation counts. |
| **Accounts** | `/api/accounts` | Stellar public key balance & trustline inspection. |
| **Assets** | `/api/assets` | Verified assets, orderbooks, and trade aggregations. |
| **Liquidity Pools** | `/api/liquidity-pools` | AMM pool TVL, reserve ratios, and APY rates. |
| **Soroban** | `/api/soroban` | WASM contract health, invocations, and events. |
| **AI** | `/api/ai` | Gemini AI copilot chat, gas profiling, anomaly checks. |
| **Dashboards** | `/api/dashboards` | Custom dashboard CRUD, layout updates, pins. |
| **Reports** | `/api/reports` | BI report generation and multi-format exports. |
| **Alerts** | `/api/alerts` | Alert rules, event log history, acknowledgment, stats. |
| **Workspaces** | `/api/workspaces` | Multi-workspace CRUD, share links, pins, search history. |
| **Search** | `/api/search` | Universal intelligence search across all entities. |
| **Settings** | `/api/settings` | Platform theme, network, and refresh preferences. |

---

## 📄 License & Governance

Nolyvatix is released under the **MIT License**. See [LICENSE](LICENSE) for details.

- **Contributing**: Please review [CONTRIBUTING.md](CONTRIBUTING.md) before submitting Pull Requests.
- **Governance & Maintainers**: See [MAINTAINER.md](MAINTAINER.md) for maintainer protocols.
- **Security**: See [SECURITY.md](SECURITY.md) for vulnerability reporting procedures.
