# Nolyvatix - Technical Architecture Blueprint

**Document Version:** 1.0.0  
**Status:** Approved Architectural Specification  
**Author:** Lead Software Architect & Principal Engineering Team  
**Target Platform:** Stellar Blockchain Ecosystem  

---

## 1. Overall System Architecture

Nolyvatix is built on a **Modular Monolith Architecture with Real-Time Event Workers**, optimized for high-throughput blockchain ingestion, sub-second query latency, and AI-driven intelligence.

### High-Level System Architecture Diagram

```mermaid
flowchart TB
    subgraph External System & Blockchain Nodes
        Horizon["Stellar Horizon REST/SSE APIs"]
        SorobanRPC["Soroban JSON-RPC 2.0 Nodes"]
        GeminiAPI["Google Gemini AI Service (@google/genai)"]
        StellarWallets["Stellar Wallets (Freighter / Albedo)"]
    end

    subgraph Ingestion & Processing Layer
        HorizonIngestor["Horizon Stream Ingestor"]
        SorobanIndexer["Soroban WASM Event Indexer"]
        WorkerQueue["Background Job Engine (Redis / BullMQ)"]
    end

    subgraph Data & Storage Layer
        TimescaleDB[(PostgreSQL + TimescaleDB Hypertables)]
        RedisCache[(Redis Cache & Pub/Sub Backplane)]
    end

    subgraph Backend API Gateway (Express Node.js)
        AuthService["Auth & Web3 Wallet Verification"]
        AnalyticsService["Analytics Query Service"]
        GeminiService["Gemini AI Co-Pilot Engine"]
        RealtimeGateway["WebSocket / SSE Realtime Hub"]
    end

    subgraph Frontend Client (React 19 + Vite)
        UIStateStore["Zustand Client Store"]
        QueryCache["TanStack Query Cache"]
        DashboardUI["Drag-and-Drop Dashboard Engine"]
        AIWidget["Gemini AI Chat & Insights Control"]
    end

    %% Flow Connections
    Horizon -->|SSE Ledger Stream| HorizonIngestor
    SorobanRPC -->|JSON-RPC Events| SorobanIndexer
    HorizonIngestor --> TimescaleDB
    SorobanIndexer --> TimescaleDB
    
    Backend API Gateway <-->|Drizzle ORM| TimescaleDB
    Backend API Gateway <-->|Pub/Sub & Caching| RedisCache
    
    Backend API Gateway <-->|@google/genai| GeminiAPI
    StellarWallets <-->|Ed25519 Signature| AuthService
    
    DashboardUI <--> QueryCache
    QueryCache <-->|REST API v1| AnalyticsService
    AIWidget <-->|NL Query API| GeminiService
    DashboardUI <-->|WebSocket/SSE Stream| RealtimeGateway
```

---

## 2. Frontend Architecture

The frontend is engineered as a modern, high-density Single Page Application (SPA) using **React 19**, **Vite**, **Tailwind CSS v4**, and **Motion**.

### 2.1 Core Architectural Principles
- **Atomic Component Hierarchy**: UI built using strict atomic principles (`ui/`, `widgets/`, `views/`).
- **High-Performance Canvas Rendering**: Standard charts rendered via **Recharts**, while high-frequency data streams (e.g., live ledger graph topology) utilize customized WebGL / D3 rendering.
- **Zero-Layout-Shift Grid**: Dashboard widgets powered by a dynamic grid layout engine with persistent coordinate state.

---

## 3. Backend Architecture

The backend utilizes an **Express + Node.js Modular Monolith** pattern with explicit service layering.

```
┌─────────────────────────────────────────────────────────┐
│                      Express Router                     │
├─────────────────────────────────────────────────────────┤
│ Controllers (Request validation, DTO mapping)          │
├─────────────────────────────────────────────────────────┤
│ Domain Services (Business logic, Gemini orchestration)  │
├─────────────────────────────────────────────────────────┤
│ Repositories (Data access via Drizzle ORM)             │
├─────────────────────────────────────────────────────────┤
│ Database (PostgreSQL / TimescaleDB Hypertables)         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Database Architecture & Schema Design

Powered by **PostgreSQL** with **TimescaleDB hypertables** for time-series ledger sequence data and **Drizzle ORM** for type-safe database interactions.

### 4.1 Key Database Tables & ERD Concept

```mermaid
erDiagram
    USERS ||--o{ DASHBOARDS : owns
    USERS ||--o{ ALERTS : configures
    LEDGERS ||--|{ TRANSACTIONS : contains
    TRANSACTIONS ||--o{ SOROBAN_EVENTS : emits
    ASSETS ||--o{ LIQUIDITY_POOLS : forms
    
    USERS {
        uuid id PK
        string public_key UK
        string role
        timestamp created_at
    }
    LEDGERS {
        bigint sequence PK
        string ledger_hash
        integer tx_count
        timestamp closed_at
    }
    TRANSACTIONS {
        string hash PK
        bigint ledger_sequence FK
        string source_account
        bigint fee_charged
        boolean successful
    }
    SOROBAN_EVENTS {
        uuid id PK
        string tx_hash FK
        string contract_id
        string type
        jsonb topic_xdr
        jsonb data_xdr
    }
    DASHBOARDS {
        uuid id PK
        uuid user_id FK
        string title
        jsonb layout_config
        boolean is_public
    }
```

---

## 5. Repository Folder Structure

```
/
├── docs/
│   ├── PRD.md                     # Product Requirements Document
│   └── ARCHITECTURE.md            # Technical Blueprint Document
├── server/
│   ├── config/                    # Environment & Server Config
│   ├── controllers/               # Express Request Route Handlers
│   ├── services/                  # Business Logic & External APIs
│   │   ├── horizon.service.ts     # Horizon API Client
│   │   ├── soroban.service.ts     # Soroban RPC Client
│   │   └── gemini.service.ts      # @google/genai Client
│   ├── db/                        # Database Schema & Drizzle Setup
│   │   ├── schema.ts              # Drizzle Schema Definitions
│   │   └── migrations/            # Drizzle Migration Scripts
│   ├── ingestors/                 # Ledger & Event Stream Processors
│   ├── middleware/                # Auth, Rate Limit, Error Handling
│   └── server.ts                  # Server Entry Point
├── src/
│   ├── components/                # React Components
│   │   ├── ui/                    # Reusable Base Components
│   │   ├── widgets/               # BI Dashboard Cards & Visuals
│   │   ├── soroban/               # Soroban APM Components
│   │   └── ai/                    # Gemini AI Assistant Components
│   ├── hooks/                     # Custom React Hooks
│   ├── store/                     # Zustand UI Stores
│   ├── types/                     # Shared TypeScript Types
│   ├── App.tsx                    # Main App Shell
│   └── main.tsx                   # Frontend Mounting
├── metadata.json                  # Application Metadata
└── package.json                   # Dependencies & Build Scripts
```

---

## 6. Component Hierarchy

```
App
├── AppHeader (Network Status, Ledger Pulse, Wallet Connect Button)
├── NavigationSidebar (Command Center, Soroban APM, Assets & Pools, AI Co-Pilot, Settings)
└── MainWorkspace
    ├── CommandCenterView
    │   ├── LedgerMetricsBanner (TPS, Avg Close, Total Volume)
    │   ├── LiveLedgerFeedTable
    │   └── CorridorVolumeChart
    ├── SorobanInspectorView
    │   ├── ContractSearchBar
    │   ├── InvocationGasGraph
    │   └── EventDecoderStream
    ├── CustomDashboardView
    │   ├── DashboardToolbar (Add Widget, Grid Layout, Export PDF)
    │   └── DraggableWidgetGrid
    │       ├── MetricCardWidget
    │       ├── TimeseriesChartWidget
    │       └── AssetDistributionPieWidget
    └── GeminiAICoPilotDrawer
        ├── ChatThreadHistory
        ├── QueryInputBar ("Ask Gemini")
        └── AutoInsightCard (Generated Chart + AI Narrative)
```

---

## 7. API Structure (RESTful Endpoints)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/v1/health` | Service & RPC connectivity health check |
| **GET** | `/api/v1/ledger/latest` | Returns latest ledger sequence & metrics |
| **GET** | `/api/v1/ledger/history` | Historical TPS and volume timeseries |
| **GET** | `/api/v1/soroban/contracts/:id` | Contract performance, gas usage & events |
| **GET** | `/api/v1/assets/corridors` | Cross-border anchor volume metrics |
| **POST**| `/api/v1/ai/query` | Gemini AI NL-to-Analytics query handler |
| **POST**| `/api/v1/ai/explain-anomaly` | AI summary for specific ledger anomaly |
| **POST**| `/api/v1/auth/challenge` | Generates nonce for wallet signature |
| **POST**| `/api/v1/auth/verify` | Verifies wallet signature & issues JWT |

---

## 8. Authentication Flow (Stellar Wallet Web3 Auth)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend
    participant Backend API
    participant StellarWallet as Wallet (Freighter/Albedo)

    User->>Frontend: Click "Connect Stellar Wallet"
    Frontend->>StellarWallet: Request Public Key
    StellarWallet-->>Frontend: Returns Public Key (e.g., GABC...)
    Frontend->>Backend API: POST /api/v1/auth/challenge { publicKey }
    Backend API-->>Frontend: Returns Nonce / Challenge Message
    Frontend->>StellarWallet: Request Signature for Nonce
    StellarWallet-->>User: Prompt Wallet Confirmation
    User->>StellarWallet: Approve Signature
    StellarWallet-->>Frontend: Returns Cryptographic Signature
    Frontend->>Backend API: POST /api/v1/auth/verify { publicKey, signature, nonce }
    Note over Backend API: Verifies Ed25519 Signature using stellar-sdk
    Backend API-->>Frontend: Issues HttpOnly JWT Session Cookie
```

---

## 9. State Management Strategy

1. **Server State (TanStack Query v5)**
   - Manages all remote API requests, query caching, background polling, and optimistic updates.
   - Cache keys: `['ledgers', sequence]`, `['soroban', contractId]`, `['dashboards', id]`.

2. **Client UI State (Zustand)**
   - Manages local drawer toggles, active filter selections, wallet connection status, and drag-and-drop dashboard grid configurations.

---

## 10. Stellar Horizon Integration

- Built using official `@stellar/stellar-sdk`.
- **Stream Ingestion**: Connects to `/ledgers` Server-Sent Events stream for real-time ledger closes.
- **Failover Strategy**: Configured with a pool of fallback Horizon instances (e.g., SDF Public, Lobstr, Blockdaemon).

---

## 11. Soroban RPC Integration

- Interacts with Soroban JSON-RPC 2.0 endpoints using `soroban-client`.
- **Event Filtering**: Polls `getEvents` RPC method filtered by `topics` and `contractIds`.
- **Gas Profiler**: Extracts `cpuInsns` and `memBytes` from transaction execution logs to calculate WASM resource usage.

---

## 12. Google Gemini Integration

Integrated server-side via `@google/genai` using the `gemini-2.5-flash` model.

### 12.1 Implementation Pattern
- **NL-to-Analytics**: User asks a query -> Gemini converts prompt into structured JSON query parameters -> Server queries database -> Gemini generates narrative insights alongside rendered charts.
- **Security Guardrail**: Gemini API key is maintained exclusively on the server (`process.env.GEMINI_API_KEY`) and never exposed to the client.

---

## 13. Real-Time Update Architecture (WebSocket / SSE)

- **Protocol**: Server-Sent Events (SSE) for ledger broadcasts; WebSocket (`ws`) for bidirectional dashboard controls.
- **Pub/Sub Backplane**: Powered by Redis Pub/Sub to fan out ledger events across multiple horizontal Express container instances.

---

## 14. Security Architecture

- **Zero-Trust Key Management**: No private keys are ever collected or stored.
- **Input Validation**: Strict Zod schema validation on all incoming API requests.
- **Rate Limiting**: Express rate limiting (`express-rate-limit`) restricting high-frequency API abuse.
- **Security Headers**: Helmet.js enforcement of strict CSP, HSTS, and X-Frame-Options.

---

## 15. Deployment Architecture

Containerized with Docker and deployed to **Google Cloud Run**.

```
[ Ingress / Nginx Reverse Proxy (Port 3000) ]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
[ Cloud Run Container A ]  [ Cloud Run Container B ]
         │                       │
         └───────────┬───────────┘
                     ▼
  [ Managed Cloud SQL PostgreSQL + TimescaleDB ]
```

---

## 16. Environment Variables Specification

Declared in `.env.example`:

```env
# Server Runtime Environment Variables
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://user:password@localhost:5432/nolyvatix
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=MY_GEMINI_API_KEY
STELLAR_HORIZON_URL=https://horizon.stellar.org
SOROBAN_RPC_URL=https://soroban-rpc.mainnet.stellar.org
JWT_SECRET=super-secret-jwt-key

# Client Public Variables
VITE_APP_TITLE="Nolyvatix BI Platform"
VITE_STELLAR_NETWORK="mainnet"
```

---

## 17. Logging Strategy

- **Structured JSON Logging**: Powered by `pino` logger.
- **Correlation IDs**: All requests tagged with an `X-Correlation-ID` header to trace ledger ingestion through database operations and API responses.

---

## 18. Error Handling Strategy

- Standardized **RFC 7807 Problem Details** for HTTP error responses:
  ```json
  {
    "type": "https://nolyvatix.io/errors/horizon-timeout",
    "title": "Stellar Horizon Stream Timeout",
    "status": 504,
    "detail": "Failed to receive ledger close signal within 15 seconds.",
    "instance": "/api/v1/ledger/latest"
  }
  ```
- Frontend Global Error Boundaries catching UI crashes with graceful retry controls.

---

## 19. Testing Strategy

- **Unit Testing**: Vitest for utility functions, math helpers, and Drizzle query mappers.
- **Integration Testing**: Supertest against Express API routes with an in-memory PostgreSQL test container.
- **E2E Testing**: Playwright end-to-end tests covering wallet connection, dashboard creation, and Gemini AI query workflows.

---

## 20. CI/CD Pipeline

```mermaid
flowchart LR
    A[Git Push / PR] --> B[Stage 1: Lint & TypeCheck]
    B --> C[Stage 2: Vitest & Supertest]
    C --> D[Stage 3: Esbuild Docker Image]
    D --> E[Stage 4: Cloud Run Deployment]
```

---
*End of Technical Architecture Blueprint.*
