# GitHub Project Board Structure

This document outlines the recommended **GitHub Projects (v2)** board structure for managing the Nolyvatix open-source development lifecycle across Sprints and roadmap milestones.

---

## 📋 Recommended Board Type: Automated Kanban Board

Name: **Nolyvatix Core Development & Roadmap Board**

---

## 🏛️ Board Columns & Workflow States

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  📋 Backlog │ → │ 📌 Todo     │ → │ 🏃 In       │ → │ 🔍 In       │ → │ ✅ Done     │
│             │   │ (Ready)     │   │   Progress  │   │   Review    │   │             │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### 1. 📋 Backlog (Future Sprints & Raw Ideas)
- **Purpose**: Holds unscheduled feature requests, ideas, long-term roadmap items (Version 1.0 & 2.0), and un-triaged community issues.
- **Automation**: New issues with label `status: needs triage` automatically land here.

### 2. 📌 Todo (Ready for Sprint Execution)
- **Purpose**: Prioritized tasks scheduled for the active Sprint. Ready for contributors to pick up.
- **Criteria**:
  - Clear acceptance criteria defined.
  - Subsystem label assigned (e.g. `area: soroban-apm`).
  - Labelled with `status: accepted` and optionally `good first issue` or `help wanted`.

### 3. 🏃 In Progress (Active Development)
- **Purpose**: Issues and Pull Requests currently being implemented by a contributor.
- **Automation**: Moving an issue here automatically sets `status: in progress`. When a draft PR is linked, it moves here.

### 4. 🔍 In Review (Code Review & Verification)
- **Purpose**: Submitted Pull Requests undergoing maintainer review, CI lint checks, and preview verification.
- **Automation**: When a PR is opened or marked ready for review, it automatically moves here with label `status: needs review`.

### 5. ✅ Done (Merged & Released)
- **Purpose**: Completed features, bug fixes, and merged PRs included in the current build/release.
- **Automation**: Linked issues automatically move here when PRs are merged into `main`.

---

## 🎯 Custom Fields Definition

| Field Name | Type | Options / Description |
| ---------- | ---- | --------------------- |
| **Sprint** | Iteration | Sprint 1 (Foundation), Sprint 2 (Soroban APM), Sprint 3 (Corridors), etc. |
| **Priority** | Single Select | `P0 - Critical`, `P1 - High`, `P2 - Medium`, `P3 - Low` |
| **Effort Estimate** | Single Select | `XS (1pt)`, `S (2pt)`, `M (3pt)`, `L (5pt)`, `XL (8pt)` |
| **Architectural Layer** | Single Select | `Frontend UI`, `Service Integration`, `Smart Contract / RPC`, `AI Engine` |

---

## 📊 Suggested Custom Board Views

1. **Sprint Kanban View**: Filtered by active Sprint, grouped by Column Status.
2. **Roadmap Timeline View**: Grouped by Sprint iteration and milestone deliverables.
3. **Good First Issues View**: Filtered by `good first issue` and `status: accepted` to help onboard new community contributors.
4. **Soroban APM Epic View**: Filtered by `area: soroban-apm` to track WASM profiling deliverables.
