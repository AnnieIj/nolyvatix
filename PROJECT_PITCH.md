# Nolyvatix — Executive Product Pitch & Ecosystem Vision

## 💡 Executive Summary

**Nolyvatix** is an open-source, enterprise-grade Business Intelligence (BI), observability, and analytics platform built specifically for the **Stellar blockchain network** and **Soroban WASM smart contracts**.

While traditional block explorers display raw hashes and transaction lists, Nolyvatix transforms complex blockchain telemetry into actionable executive intelligence, customizable BI dashboards, automated alerting, universal search intelligence, and natural language AI analytics.

---

## 🎯 The Problem

As the Stellar ecosystem expands with cross-border remittance corridors (USDC, EURC) and Soroban smart contract dApps, institutions, developers, and ecosystem operators face severe data fragmentation challenges:

1. **Lack of Enterprise BI Workspace**: Block explorers provide static transaction lists rather than customizable drag-and-drop dashboards or scheduled reporting.
2. **Soroban WASM Opacity**: Monitoring contract CPU gas limits, memory allocations, and execution failure spikes requires manual RPC log scraping.
3. **Alerting Fragmentation**: No unified multi-channel dispatcher exists to trigger instant webhooks (Slack, Discord, Email) when whale movements or TPS drops occur.
4. **Data Export Friction**: Extracting raw blockchain metrics into compliance-ready CSV, JSON, Markdown, or PDF packages is cumbersome.

---

## 🔥 The Nolyvatix Solution

Nolyvatix solves these ecosystem challenges through a unified 8-module suite:

| Key Feature Module | Value Proposition |
| :--- | :--- |
| **Real-Time Command Center** | Low-latency Horizon REST SSE live ledger stream, block close sequence tracker, and TPS velocity graphs. |
| **Enterprise Dashboard Builder** | 12-column drag-and-drop grid layout builder with widget resizing, duplication, and layout persistence. |
| **BI Reporting Engine** | Automated daily and weekly executive digests with multi-format package exports (`JSON`, `CSV`, `Markdown`). |
| **Alert & Webhook Center** | Real-time threshold monitoring with multi-channel dispatch (Browser, Email, Webhook, Slack, Discord), event log history, and acknowledgment. |
| **Universal Search Intelligence** | Single search box querying accounts (`G...`), Soroban contracts (`C...`), ledgers, transactions, assets, AMM pools, dashboards, reports, and alerts. |
| **Workspace Management & Collaboration** | Multi-workspace management with role-based access (`owner`, `editor`, `viewer`), shareable read-only links, entity pinning, and saved AI chat threads. |
| **Unified Export Center** | Multi-format data exports (PDF, CSV, JSON, Markdown, PNG, SVG) for network telemetry, Soroban WASM performance, liquidity pools, and AI digests. |
| **Gemini AI Copilot** | Google Gemini AI integration for natural language blockchain queries, autonomous WASM execution profiling, and dynamic chart generation. |

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript 5.7, Vite, Tailwind CSS v4, Lucide React
- **State & Data Fetching**: Zustand Store, `@tanstack/react-query`
- **Data Visualization**: Recharts
- **Backend Service Engine**: Node.js Express, Dependency Injection Container (`initializeDataEngine`), `esbuild`
- **Blockchain Integrations**: Stellar Horizon REST API, Soroban JSON-RPC 2.0
- **AI Engine**: Google Gemini 2.5 Flash SDK (`@google/genai`)
- **Testing**: Node.js Native Test Runner (`node:test`) — 46/46 passing unit tests

---

## 🌐 Open-Source Impact & Ecosystem Alignment

Nolyvatix is 100% open-source under the **MIT License**. It empowers:
- **Financial Institutions & Anchors**: Monitor cross-border payment corridor volume and liquidity pool reserve ratios.
- **Soroban Smart Contract Developers**: Track contract invocation success rates, WASM CPU gas usage, and failure events.
- **Ecosystem Operations Teams**: Set real-time automated webhooks for network degradation or whale movements.
- **Community Analysts**: Build and share custom BI dashboards via read-only collaborative links.
