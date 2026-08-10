# GitHub Labels Recommendation

This document defines the official label taxonomy for the **Nolyvatix** repository to streamline issue triage, project management, and open-source contributor onboarding.

---

## 🏷️ Type Labels

Indicates the category of request or change.

| Label Name | Color | Hex Code | Description |
| ---------- | ----- | -------- | ----------- |
| `type: bug` | Red | `#d93f0b` | Something isn't working as expected. |
| `type: feature` | Blue | `#1d76db` | New analytics module, visualization, or feature request. |
| `type: documentation` | Yellow | `#0075ca` | Improvements or additions to documentation or guides. |
| `type: refactor` | Purple | `#7057ff` | Code restructuring without changing functional behavior. |
| `type: performance` | Teal | `#008672` | Optimizations for bundle size, rendering, or RPC network latency. |
| `type: security` | Dark Red | `#b60205` | Security vulnerability fixes or privacy hardening. |
| `type: maintenance` | Gray | `#8a8a8a` | Chores, dependency updates, build tooling, or config. |

---

## 🚦 Status Labels

Tracks the workflow state of issues and pull requests.

| Label Name | Color | Hex Code | Description |
| ---------- | ----- | -------- | ----------- |
| `status: needs triage` | Purple | `#ed9002` | Newly opened issue awaiting maintainer review. |
| `status: accepted` | Green | `#0e8a16` | Issue validated and approved for development. |
| `status: in progress` | Cyan | `#1d76db` | Actively being worked on by a contributor. |
| `status: blocked` | Orange | `#e99695` | Blocked by external dependencies or upstream Stellar RPC updates. |
| `status: needs review` | Blue | `#fbca04` | Pull request submitted and waiting for maintainer review. |

---

## 🌟 Contributor Focus Labels

Helps new contributors find appropriate tasks.

| Label Name | Color | Hex Code | Description |
| ---------- | ----- | -------- | ----------- |
| `good first issue` | Bright Purple | `#7057ff` | Good for newcomers to the project or codebase. |
| `help wanted` | Green | `#008672` | Maintainers actively seeking community assistance. |
| `hacktoberfest` | Orange | `#ff6a00` | Opted in for open-source community events. |

---

## 🏗️ Subsystem / Architecture Labels

Pinpoints the specific layer or module within the Nolyvatix architecture.

| Label Name | Color | Hex Code | Description |
| ---------- | ----- | -------- | ----------- |
| `area: command-center` | Sky Blue | `#38bdf8` | Real-time Horizon ledger streams, TPS graphs. |
| `area: soroban-apm` | Indigo | `#6366f1` | WASM smart contract profiler, CPU/Memory events. |
| `area: assets-corridors` | Emerald | `#10b981` | Cross-border remittance, AMM pools, stablecoin velocity. |
| `area: ai-copilot` | Amber | `#f59e0b` | Gemini 2.5 Flash AI Co-Pilot integration & prompts. |
| `area: ui-design-system` | Pink | `#ec4899` | GlassCard, StatCard, Tailwind CSS tokens & layout. |
| `area: wallet-web3` | Violet | `#8b5cf6` | Freighter, Albedo wallet connection & signature verification. |
