# VayuGati Flow — Documentation

## Documentation Overview

This folder contains all project documentation for VayuGati Flow, the AI-powered Digital Twin for Urban Traffic Management. Documents are organised by concern: high-level strategy, detailed system design, operational runbooks, and a formal Product Requirements Document (PRD).

Start here if you are new to the project, then navigate to the specific document that matches your concern.

## Documentation Governance

To keep documentation consistent and reviewable, the following governance documents apply to all contributions in `docs/`:

- [`STYLE_GUIDE.md`](STYLE_GUIDE.md) — writing, Markdown, Mermaid, requirement ID, and linking conventions.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to create, update, review, and cross-reference documentation.
- [`adr/README.md`](adr/README.md) — how Architecture Decision Records are authored and managed.

## Folder Structure

`
docs/
├── README.md                    # This file — navigation guide
├── STYLE_GUIDE.md             # Documentation style and conventions
├── CONTRIBUTING.md            # Documentation contribution workflow
├── PRD.md                       # Lightweight product brief
├── SYSTEM_OVERVIEW.md           # Architecture and data-flow overview
├── architecture.md              # Deep-dive architecture guide
├── developer-guide.md           # Developer onboarding and workflows
├── deployment.md                # Deployment runbook
├── agents.md                    # AI agent roles and responsibilities
├── images/                      # Screenshots, diagrams, and demo GIFs
│   └── README.md
├── adr/                         # Architecture Decision Records
│   ├── README.md
│   └── ADR-NNN-*.md (future)
├── prd/                         # Formal PRD sections
│   ├── 00-document-control.md
│   ├── 01-executive-overview.md
│   ├── 02-problem-domain.md
│   ├── 03-product-strategy.md
│   ├── 04-functional-requirements.md
│   ├── 05-ai-architecture.md
│   ├── 06-system-architecture.md
│   ├── 07-digital-twin.md
│   ├── 08-data-model.md
│   ├── 09-api-specification.md
│   ├── 10-user-experience.md
│   ├── 11-security.md
│   ├── 12-infrastructure.md
│   ├── 13-deployment.md
│   ├── 14-commercial-strategy.md
│   ├── 15-roadmap.md
│   ├── 16-risk-analysis.md
│   └── appendix.md
├── testing/                     # Testing documentation and runbooks
│   └── playwright.md
└── via/                         # VayuGati Intelligence Architecture
    ├── 00-document-control.md
    ├── 01-vision.md
    ├── 02-urban-knowledge-graph.md
    ├── 03-agent-architecture.md
    ├── 04-root-cause-engine.md
    ├── 05-simulation-engine.md
    ├── 06-operational-memory.md
    ├── 07-decision-intelligence.md
    ├── 08-explainability.md
    ├── 09-plugin-architecture.md
    ├── 10-learning-loop.md
    ├── 11-ai-commander.md
    └── README.md
`

## Core Documentation

- [System Overview](SYSTEM_OVERVIEW.md) — Concise architecture summary and data flow.
- [Architecture](architecture.md) — Deep-dive architecture, sequence diagrams, deployment, and scaling strategy.
- [Developer Guide](developer-guide.md) — Onboarding, coding standards, branch strategy, and contribution workflow.
- [Deployment Guide](deployment.md) — Backend/frontend deployment, environment variables, and production checklist.
- [Contributing](CONTRIBUTING.md) — Documentation contribution conventions.
- [Style Guide](STYLE_GUIDE.md) — Markdown, Mermaid, and writing standards.
- [Visual Assets](images/) — Screenshots, diagrams, and demo GIFs.

## Navigation Guide

- **New to the project?** Start with [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) for architecture, then [prd/01-executive-overview.md](prd/01-executive-overview.md) for business context.
- **Developer?** See [developer-guide.md](developer-guide.md), [prd/06-system-architecture.md](prd/06-system-architecture.md), [prd/08-data-model.md](prd/08-data-model.md), and [prd/09-api-specification.md](prd/09-api-specification.md).
- **Designer / PM?** See [prd/10-user-experience.md](prd/10-user-experience.md), [prd/04-functional-requirements.md](prd/04-functional-requirements.md), and [prd/01-executive-overview.md](prd/01-executive-overview.md).
- **DevOps / Security?** See [deployment.md](deployment.md), [prd/11-security.md](prd/11-security.md), [prd/12-infrastructure.md](prd/12-infrastructure.md), and [prd/13-deployment.md](prd/13-deployment.md).
- **Business / Commercial?** See [prd/14-commercial-strategy.md](prd/14-commercial-strategy.md), [prd/15-roadmap.md](prd/15-roadmap.md), and [prd/02-problem-domain.md](prd/02-problem-domain.md).
