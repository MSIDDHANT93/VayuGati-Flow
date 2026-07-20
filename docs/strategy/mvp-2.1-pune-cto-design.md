---
title: VayuGati Flow MVP 2.1 — Pune CTO Design
created: 2026-07-20
author: Devin
status: Active
purpose: Define the Pune-first Urban Decision Intelligence MVP, its product experience, architecture, scope, and delivery roadmap.
---

# VayuGati Flow MVP 2.1 — Pune CTO Design

## Decision Summary

VayuGati Flow is an **AI-powered Urban Decision Intelligence Platform beginning with a curated Digital Twin Library of Pune**.

The MVP does not attempt broad geographic coverage. It demonstrates a defensible operational decision loop for three premium Pune intersections whose geometry, demand assumptions, signal behavior, curb activity, and operating conditions can be physically validated by the product owner.

```text
Pune
  → Digital Twin Library
  → Hotspot
  → Scenario Library
  → Traffic State
  → Root Cause Engine
  → Simulation
  → Decision Engine
  → Before-versus-After Replay
```

## Product Vision

The audience should leave the demo believing:

> VayuGati can construct a defensible digital twin of a real Pune intersection, explain why it fails, compare operational interventions in simulation, and recommend the best decision before it is deployed.

This is not a traffic-metrics dashboard. It is a governed decision loop that distinguishes observed facts, derived values, modeled assumptions, synthetic inputs, and simulated outcomes.

## Strategic Principles

- **Depth before coverage.** Three validated Pune twins are stronger than a shallow multi-city demo.
- **Evidence before eloquence.** The reasoning layer explains structured engineering evidence; it does not invent it.
- **Operations before construction.** Reversible, low-cost interventions are evaluated before capital projects.
- **Real geography, explicit assumptions.** Every map element and model parameter has provenance.
- **Simulation as the hero.** The replay is the proof that a recommendation is more than a dashboard suggestion.

---

# 1. Definitive Demo Experience

## Hero Story

**City:** Pune  
**Primary hotspot:** Nal Stop Junction  
**Scenario:** weekday evening peak with mixed traffic, curb friction, and pedestrian activity  
**Decision question:** Which operational package reduces queue spillback and delay without a capital project?

The presenter begins at a city scale, selects a named twin from the library, chooses a scenario, watches the system build the twin, sees current failure, inspects ranked causes, compares simulated interventions, and replays the winning option.

## User Journey

```text
Choose Pune
  → browse the Digital Twin Library
  → select a hotspot
  → select a reusable scenario
  → assemble and validate the twin
  → inspect operational state
  → inspect ranked root causes and evidence
  → compare intervention simulations
  → approve the recommended decision
  → replay baseline versus improved state
  → export a decision brief
```

## Screen-by-Screen Storyboard

| Screen | User experience | Required proof point |
|---|---|---|
| Pune Loader | Pune map, library coverage, data freshness, offline-pack status | the product is grounded in a city, not generic scenarios |
| Digital Twin Library | named twin cards, validation status, scenario coverage, model confidence | each hotspot is a reusable platform asset |
| Twin Assembly | roads, lanes, signals, crossings, buses, parking, camera zones, conflict zones appear in sequence | the system understands the junction’s operating geometry |
| Operations Center | queues, delay, LOS, speed, occupancy, travel time, risk and timeline | current conditions are quantitatively clear |
| Root Cause Engine | ranked causes with probability, confidence, evidence and impact | the platform answers why congestion occurs |
| Simulation Arena | baseline plus three interventions, synchronized outcome metrics | alternatives are tested under the same conditions |
| Decision Brief | recommended action, trade-offs, rejected alternatives, confidence | the recommendation is governed and explainable |
| Replay Studio | baseline and recommendation play side-by-side | the operational impact is emotionally and technically visible |

## Twin Assembly Animation

```text
1. Render road centerlines and intersection footprint
2. Reveal lane boundaries, turn arrows, and movement graph
3. Add signal heads, phase groups, bus stops, crossings, parking and cameras
4. Display conflict zones and queue-detection regions
5. Load scenario demand and vehicle mix
6. Run twin readiness checks
7. Start the operational replay
```

The interface labels each layer with its provenance: **Observed**, **Derived**, **Modeled**, **Synthetic**, or **Simulated**.

---

# 2. Digital Twin Library as a First-Class Platform Component

## Library Contract

A Digital Twin is a versioned, validated, reusable asset—not a screen-specific map configuration.

```text
DigitalTwin
  ├─ geometry package
  ├─ lane and movement graph
  ├─ signal-controller model
  ├─ curb, bus, pedestrian and conflict-zone layers
  ├─ sensor and observation coverage
  ├─ demand-profile bindings
  ├─ scenario templates
  ├─ intervention templates
  ├─ simulation-network version
  ├─ validation evidence
  └─ provenance and confidence manifest
```

## Core Entities

| Entity | Responsibility |
|---|---|
| `City` | geographic extent, civic-data catalog, map package, data policy |
| `DigitalTwin` | versioned operational model of a named hotspot |
| `Hotspot` | recognizable operator-facing location and operational problem |
| `ScenarioTemplate` | reusable event and demand configuration |
| `DemandProfile` | approach flows, turning matrix, vehicle mix, bus/pedestrian behavior |
| `Observation` | field-validated fact, source, time, reviewer, confidence |
| `Assumption` | modeled or synthetic parameter with rationale and expiry/review date |
| `CauseAssessment` | ranked cause, evidence graph, probability, confidence, impact |
| `InterventionTemplate` | feasible action, constraints, cost/time/complexity model |
| `SimulationRun` | immutable network, demand, intervention, seed, outcome, trajectory record |
| `DecisionBrief` | recommendation, trade-offs, approval state, evidence and versions |

## Twin Readiness States

```text
DRAFT           geometry imported; not field-verified
CURATED         geometry and operational layers reviewed
VALIDATED       required field observations complete
CALIBRATED      baseline simulation meets defined acceptance range
DEMO_READY      scenario, simulations and replay approved
PILOT_READY     authorized live or historical data integration approved
```

---

# 3. Technical Architecture

```text
┌────────────────────────────────────────────────────────────┐
│ React + TypeScript + MapLibre Experience                    │
│ Pune Loader | Twin Library | Operations | Simulation | Replay│
└─────────────────────────────┬──────────────────────────────┘
                              │ REST + SSE/WebSocket
┌─────────────────────────────▼──────────────────────────────┐
│ FastAPI API / Scenario Orchestrator                         │
├──────────────┬───────────────┬───────────────┬─────────────┤
│ Twin Registry│ Traffic State │ Cause + Decision│ Replay API │
├──────────────┴──────┬────────┴───────┬────────┴─────────────┤
│ PostGIS + Object Store│ SUMO Runner Pool │ Reasoning Service │
└──────────────────────┴──────────┬─────┴─────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │ Pune data packages         │
                    │ OSM | PMC | PMRDA | Field  │
                    └───────────────────────────┘
```

## Recommended Stack

| Concern | Recommendation |
|---|---|
| Map and twin rendering | MapLibre GL JS, vector tiles/PMTiles, custom lane and agent layers |
| Frontend state | explicit product workflow state machine; Zustand or Redux Toolkit |
| Server state | TanStack Query for cache, loading and invalidation behavior |
| Core API | FastAPI with typed domain and scenario contracts |
| Geospatial persistence | PostgreSQL + PostGIS |
| Static geometry and replay assets | object storage plus versioned PMTiles/GeoJSON/trajectory bundles |
| Simulation | SUMO service workers controlled through TraCI or libsumo |
| Job execution | Redis-backed queue with idempotent simulation jobs |
| Caching | Redis for results; CDN/browser cache for tiles and replay assets |
| Reasoning | constrained LLM explanation over structured, deterministic evidence |

## Simulation Recommendation

Use **SUMO** for the MVP’s lane-level simulation and replay. It is a mature microscopic simulator with signal control, routes, queues, vehicle trajectories, and OpenStreetMap import paths. The MVP should not build a proprietary microscopic simulator.

Use a hybrid execution model:

```text
Curated Pune network
  → field-corrected SUMO network
  → baseline and intervention demand variants
  → precomputed standard runs
  → optional live parameter variation
  → normalized metrics and trajectories
  → decision ranking and synchronized replay
```

The standard demo should use precomputed calibrated runs for predictable latency. A live run is an enhancement and must visibly indicate runtime, scenario seed, and model version.

## AI Reasoning Boundary

```text
Traffic features + field evidence + simulation results
  → deterministic cause scoring
  → intervention feasibility rules
  → multi-objective ranking
  → constrained LLM explanation
  → schema validation and provenance links
```

The LLM explains conclusions. It does not invent observations, confidence values, or engineering metrics.

## Caching and Offline Capability

| Asset | Delivery approach |
|---|---|
| Pune basemap and twin geometry | bounded city-region PMTiles/vector package |
| Twin definitions and validation evidence | versioned JSON/GeoJSON, browser IndexedDB cache |
| Standard scenarios and replay assets | precomputed compressed trajectory bundles |
| Simulation results | Redis result cache and object-store archive |
| Reasoning briefs | cache by simulation-run ID and evidence hash |

The offline demo bundle includes Pune map coverage, three twin packages, scenario definitions, standard simulations, decision briefs, and replay trajectories. Public map endpoints must not be a runtime dependency of a live demo.

---

# 4. Decision and Replay Experience

## Root Cause Cards

Each cause must display:

```text
Cause
Probability
Confidence
Evidence
Estimated impact on queue/delay/risk
Observed versus modeled status
Linked interventions
```

## Intervention Cards

Each intervention must display:

```text
Target causes
Expected queue reduction
Expected speed and travel-time improvement
Safety/risk impact
Cost band
Implementation time
Operational complexity
Policy constraints
Confidence and simulation status
```

## Recommendation Logic

```text
decision score =
  mobility benefit
+ queue and spillback reduction
+ safety benefit
+ implementation feasibility
+ cost efficiency
+ confidence
- policy or operational penalties
```

Weights must be visible and configurable; the operator should be able to prioritize bus reliability, emergency access, safety, or travel-time reduction.

## Replay Climax

```text
LEFT:  baseline at selected minute
RIGHT: recommended intervention at same minute

Synchronize:
vehicles | queues | signals | road colors | bus dwell | conflict zones |
travel time | delay | risk | timeline events
```

The closing statement is evidence-backed and scenario-specific, for example:

> Under the calibrated evening-peak scenario, the recommended plan prevents upstream queue spillback and reduces modeled corridor travel time without requiring capital construction.

---

# 5. MVP Scope and Roadmap

## MVP 2.1 Scope

- One city: **Pune**.
- Three premium, field-validated digital twins.
- Multiple reusable scenarios per twin.
- OSM-based, locally corrected geometry and lane/movement configuration.
- SUMO baseline and at least three intervention variants per hero scenario.
- Root-cause evidence, confidence and impact ranking.
- Decision comparison and before-versus-after replay.
- Offline-capable curated demo bundle.

## Explicitly Deferred

- citywide real-time traffic control,
- unvalidated citywide network simulation,
- live camera ingestion as a demo dependency,
- autonomous signal actuation,
- multiple cities with equivalent fidelity,
- production integration with proprietary traffic feeds.

## Delivery Roadmap

### Phase 1 — Pune Premium Demo

```text
Pune
  → three premium twins
  → scenario library
  → SUMO simulations
  → root-cause and decision support
  → replay
```

Success criterion: a transport stakeholder can inspect evidence, understand trade-offs, and trust the recommendation boundary.

### Phase 2 — Pune Pilot

- five to ten twins or one corridor,
- authorized historical or live data integrations,
- field-calibration workflow,
- operator notes and approvals,
- post-intervention comparison against observed outcomes.

### Phase 3 — Production Decision Support

- authentication, roles and audit trail,
- data quality monitoring and lineage,
- resilient job queue and observability,
- city-system integration,
- governed model lifecycle.

### Phase 4 — City-Scale Platform

- network/corridor coordination,
- hybrid microscopic and macroscopic simulation,
- transit/emergency optimization,
- multi-agency workflows,
- city package and Digital Twin Library expansion.

---

# 6. Bengaluru-to-Pune Migration Notes

## What Changed

| Bengaluru-first direction | Pune-first MVP 2.1 direction |
|---|---|
| Bengaluru was the hero city | Pune is the only production-quality MVP hero city |
| named Bengaluru hotspot library | Pune Digital Twin Library is the first-class platform asset |
| city → hotspot narrative | city → twin library → hotspot → scenario narrative |
| one hero scenario per hotspot | reusable scenario library per twin |
| broader city preview emphasis | depth, field validation, provenance and replay quality |
| hypothetical city familiarity | product-owner physical access and direct observation |

## Why It Changed

- The product owner has stronger local knowledge of Pune.
- Intersections can be repeatedly visited and independently validated.
- Photos, videos, lane counts, signal observations, curb use, crossings, and bus behavior can be captured directly.
- Assumptions can be defended rather than merely presented.
- The platform architecture remains city-agnostic; Pune is the validated starting library, not a product limitation.

## What Did Not Change

- The Urban Decision Intelligence product vision.
- The core chain from traffic state through root cause, simulation, decision support and replay.
- The MapLibre, FastAPI, deterministic analytics, constrained AI reasoning, and SUMO MVP architecture.
- The need for explicit data provenance, human approval, and non-autonomous operation.

## Required Narrative Change

Do not say: “VayuGati is a Bengaluru traffic demo.”

Say: “VayuGati is an Urban Decision Intelligence Platform beginning with a curated, field-validated Digital Twin Library of Pune.”

---

# 7. Risks and Guardrails

| Risk | Mitigation |
|---|---|
| incomplete OSM lane/signal details | curated correction and field-validation checklist for each twin |
| source data not current or redistributable | data register, license review and versioned source manifest |
| synthetic data mistaken for real measurements | persistent provenance labels in UI and exported brief |
| poor simulation calibration | defined baseline acceptance tests and transportation-engineer review |
| LLM overclaiming | structured inputs, schema validation and evidence links |
| scope drift across Pune | three premium twins before any fourth twin |
| demo runtime failure | offline package and precomputed standard simulation variants |

## Approval Gate

A twin cannot be called **Demo Ready** until it has a completed validation manifest, baseline simulation acceptance record, scenario review, and provenance audit.
