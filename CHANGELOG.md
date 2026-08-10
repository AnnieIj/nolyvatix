# Changelog

All notable changes to the **Nolyvatix** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-10

### Added
- **Sprint 1 Core Architecture**: React 19, TypeScript, Vite, Tailwind CSS v4, and `@tanstack/react-query` foundation.
- **LumenIQ Enterprise Design Tokens**: High-contrast dark theme canvas, glassmorphism card wrappers, status chips, and typography hierarchy.
- **Real-time Command Center View**:
  - Live ledger close sequence stream listener.
  - TPS time-series graph rendered with Recharts.
  - Network telemetry stat cards (TPS, Ledger Sequence, Close Latency, 24h Volume).
- **Service Layer Integrations**:
  - `HorizonService`: Stellar REST Horizon endpoint client with SSE stream support.
  - `SorobanService`: JSON-RPC 2.0 client for Soroban WASM smart contract invocations.
  - `GeminiService`: Server-side integration with `@google/genai` (Gemini 2.5 Flash).
- **Gemini AI Co-Pilot**: Interactive side-drawer with natural language prompt parser and dynamic chart generation.
- **Stellar Web3 Wallet Modal**: Connection state support for Freighter and Albedo.
- **Open-Source Repository Package**:
  - Detailed product documentation (`PRD.md`, `ARCHITECTURE.md`).
  - Open-source governance files (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `ROADMAP.md`, `LICENSE`).
  - GitHub issue and pull request templates.
