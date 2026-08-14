# Nolyvatix - Open-Source Stellar Blockchain BI & Analytics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/nolyvatix/nolyvatix)
[![React](https://img.shields.io/badge/React-19.0-sky)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-38bdf8)](https://tailwindcss.com/)
[![Stellar](https://img.shields.io/badge/Stellar-Horizon%20%2F%20Soroban-007afe)](https://stellar.org/)

**Nolyvatix** is an enterprise-grade, open-source Business Intelligence (BI) and observability platform designed specifically for the **Stellar blockchain ecosystem**.

The platform ingests real-time Stellar ledger Server-Sent Events (SSE), payment corridor telemetry, and Soroban WASM smart contract JSON-RPC events. It synthesizes complex blockchain data into interactive real-time dashboards, natural language AI insights, and enterprise health monitoring.

---

## 🌟 Key Features

### ⚡ Real-Time Command Center
- **Live Ledger Stream**: Continuous, low-latency stream of ledger closes, operations count, and base fee metrics via Horizon REST SSE.
- **Network Throughput Analytics**: Time-series telemetry graphs for Transactions Per Second (TPS) and payment volume velocity.
- **Stellar Network Switcher**: Seamless toggling between Stellar `Mainnet` and `Testnet` environments.

### 🔮 Gemini AI Co-Pilot
- **Natural Language Querying**: Ask plain-English questions about ledger trends, Soroban WASM contract execution, or anchor volumes.
- **Dynamic Chart Synthesizer**: Powered by `@google/genai` (Gemini 2.5 Flash), automatically converting query responses into interactive Recharts graphs.

### 🛡️ Web3 Stellar Wallet Integration
- **Cryptographic Authentication**: Support for popular browser extension wallets including **Freighter** and **Albedo**.

### 🧩 Enterprise UI Design System (*LumenIQ*)
- **High-Contrast Dark Canvas**: Optimized for financial engineering and operations, featuring glassmorphism cards, responsive typography, and subtle grid overlays.

---

## 🖼️ Screenshots & Interface Preview

*(Placeholders for release screenshots)*

| Real-Time Command Center | Gemini AI Co-Pilot Drawer |
| :---: | :---: |
| ![Command Center Dashboard](https://raw.githubusercontent.com/nolyvatix/nolyvatix/main/docs/assets/command-center-preview.png) | ![Gemini AI Co-Pilot](https://raw.githubusercontent.com/nolyvatix/nolyvatix/main/docs/assets/ai-copilot-preview.png) |

| Soroban WASM APM (Upcoming) | Assets & Anchor Corridors (Upcoming) |
| :---: | :---: |
| ![Soroban APM](https://raw.githubusercontent.com/nolyvatix/nolyvatix/main/docs/assets/soroban-apm-preview.png) | ![Anchor Corridors](https://raw.githubusercontent.com/nolyvatix/nolyvatix/main/docs/assets/anchor-corridors-preview.png) |

---

## 🏛️ Architecture Overview

Nolyvatix is built on a full-stack, decoupled architecture to ensure security and scalability:

```
                  ┌──────────────────────────────────────────────┐
                  │              Browser / User UI               │
                  │   React 19 + TypeScript + Tailwind CSS v4    │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │          State & Data Management              │
                 │   Zustand Store + TanStack React Query        │
                 └──────┬────────────────────┬───────────────────┘
                        │                    │
  ┌─────────────────────┴───────┐   ┌────────┴──────────────────────────┐
  │   Stellar Ecosystem Layer   │   │     Backend / Server Proxy Layer  │
  ├─────────────────────────────┤   ├───────────────────────────────────┤
  │ • Horizon REST API (SSE)    │   │ • Express Node.js Server          │
  │ • Soroban JSON-RPC 2.0      │   │ • Google Gemini API (@google/genai)│
  │ • Web3 Wallet Extensions    │   │ • Key Security & Proxying         │
  └─────────────────────────────┘   └───────────────────────────────────┘
```

For full technical specifications, refer to [ARCHITECTURE.md](docs/ARCHITECTURE.md) and [PRD.md](docs/PRD.md).

---

## 💻 Tech Stack

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript 5.7](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & Motion**: [Tailwind CSS v4](https://tailwindcss.com/), [Motion](https://motion.dev/)
- **State & Data Fetching**: [Zustand](https://zustand-demo.pmnd.rs/), [@tanstack/react-query](https://tanstack.com/query)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Blockchain Integrations**: Stellar Horizon REST API, Soroban JSON-RPC 2.0
- **AI Engine**: Google Gemini 2.5 Flash SDK (`@google/genai`)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started & Local Development

### Prerequisites

Ensure you have the following installed locally:
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher

### Installation Guide

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/nolyvatix/nolyvatix.git
   cd nolyvatix
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   VITE_HORIZON_URL="https://horizon.stellar.org"
   VITE_SOROBAN_RPC_URL="https://soroban-rpc.mainnet.stellar.org"
   ```

4. **Run Locally**:
   Start the development server:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` in your browser.

5. **Typecheck & Linting**:
   ```bash
   npm run lint
   ```

6. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📁 Folder Structure

```
/
├── .github/                       # GitHub Templates & Workflows
│   ├── ISSUE_TEMPLATE/            # Bug Report, Feature Request, Docs Templates
│   └── PULL_REQUEST_TEMPLATE.md   # Pull Request Template
├── docs/                          # Technical Documentation
│   ├── ARCHITECTURE.md            # System Architecture Blueprint
│   ├── PRD.md                     # Product Requirements Document
│   ├── LABELS.md                  # GitHub Label Taxonomy
│   └── PROJECT_BOARD.md           # Project Board Structure
├── src/                           # Application Source Code
│   ├── components/                # Modular UI Design System
│   │   ├── ai/                    # Gemini AI Co-Pilot Drawer
│   │   ├── common/                # StatCard, ChartContainer, ErrorBoundary
│   │   ├── layout/                # AppHeader, Sidebar, WorkspaceHeader, Footer
│   │   └── ui/                    # Button, GlassCard, Badge, Input, StatusChip, Modal
│   ├── lib/                       # Utility Functions (formatting, cn)
│   ├── router/                    # AppRouter navigation & URL hash sync
│   ├── services/                  # API Services & TanStack Query Client
│   │   ├── api/                   # Horizon, Soroban, Gemini Services
│   │   └── queryClient.ts         # Query Client Setup
│   ├── store/                     # Zustand Global Application Store
│   ├── types/                     # TypeScript Domain Models & Interfaces
│   ├── views/                     # Workspace Views (CommandCenter, SorobanAPM, etc.)
│   ├── App.tsx                    # Root Application Component
│   ├── index.css                  # Tailwind CSS & Global Design Tokens
│   └── main.tsx                   # Entry Mount
├── .env.example                   # Environment Template
├── CHANGELOG.md                   # Version Release Log
├── CODE_OF_CONDUCT.md             # Contributor Covenant v2.1
├── CONTRIBUTING.md                # Development & Contribution Guide
├── LICENSE                        # MIT License
├── ROADMAP.md                     # Feature Roadmap
├── SECURITY.md                    # Security & Vulnerability Disclosure Policy
└── README.md                      # Project Overview
```

---

## 🗺️ Roadmap & Upcoming Features

- **Phase 1 (Complete)**: Sprint 1 MVP Foundation, Command Center, Horizon SSE Stream, Gemini Co-Pilot Drawer.
- **Phase 2 (v1.0)**: Soroban WASM Smart Contract Profiler, Anchor Corridor Remittance Maps, PostgreSQL layout persistence.
- **Phase 3 (v2.0)**: Drag-and-Drop 12-Column Dashboard Builder, Discord/Slack Webhook Alert Engine.

For complete roadmap details, visit [ROADMAP.md](ROADMAP.md).

---

## 🤝 Contributing

We welcome contributions from the open-source community! Please review our [CONTRIBUTING.md](CONTRIBUTING.md) guide and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting pull requests.

Check out our [Good First Issues](https://github.com/nolyvatix/nolyvatix/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) to get started!

---

## 🛡️ Security

If you discover a security vulnerability, please refer to our [SECURITY.md](SECURITY.md) policy and disclose it responsibly via email at [security@nolyvatix.org](mailto:security@nolyvatix.org).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

*Nolyvatix — Business Intelligence for the Stellar Blockchain Ecosystem.*
