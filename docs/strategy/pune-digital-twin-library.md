---
title: VayuGati Flow — Pune Digital Twin Library Strategy
created: 2026-07-20
author: Devin
status: Active
purpose: Define Pune hotspot prioritization, reusable scenarios, field validation, provenance, and data-source strategy for MVP 2.1.
---

# Pune Digital Twin Library Strategy

## 1. Purpose

This document operationalizes the Pune-first strategy. It selects the first premium digital twins, defines their scenario coverage, and establishes a field-validation and data-provenance discipline.

The library must make every demonstrable claim traceable to an observation, a cited source, an explicit model assumption, a synthetic generation rule, or a simulator output.

---

# 2. Pune Hotspot Evaluation Matrix

## Scoring Method

Scores are out of 10 and prioritize MVP defensibility, not simply traffic severity.

```text
MVP suitability =
  25% field validation access
+ 20% operational richness
+ 15% recurring/recognizable congestion
+ 15% digital-twin geometry feasibility
+ 10% scenario diversity
+ 10% open mapping/data coverage
+ 5% simulation complexity fit
```

A high complexity score means complexity is manageable for an MVP; it does not mean the junction is simplistic.

## Candidate Matrix

| Candidate | Why important / pattern | Primary causes to test | Twin characteristics | Open mapping | Complexity fit | MVP score | Recommendation |
|---|---|---|---|---|---:|---:|---|
| **Nal Stop Junction** | West-Pune mixed-use node connecting Deccan, Kothrud, Karve Road and Mhatre Bridge; peak traffic and active curb/pedestrian conditions | phase imbalance, curb friction, mixed two-wheeler flow, pedestrian crossings, bus/auto stopping | compact, legible multi-arm intersection; flyover/metro context adds a rich but bounded model | strong OSM base; field capture can close lane/signal gaps | 8 | **9.2** | **Hero Twin 1** |
| **University Circle / SPPU Square** | Critical Ganeshkhind Road connection among Shivajinagar, Aundh, Pashan, Baner and Senapati Bapat Road; evolving flyover/metro conditions | movement restrictions, signal-plan changes, ramp merges, pedestrian phases, peak directional demand | complex grade-separated, multi-level node with changing geometry | strong OSM base; project state needs field confirmation | 6 | **8.7** | **Hero Twin 2** |
| **Swargate / Jedhe Chowk** | high-value public transport interchange where arterial roads, buses, metro, autos and pedestrians meet | bus/auto dwell, pedestrian crossing demand, curb blockage, lane allocation, turning conflicts | five-arm central-city junction with bus-terminal and metro interface | strong OSM base; rich field observation value | 7 | **8.6** | **Hero Twin 3** |
| Hinjawadi Phase 1 | office-peak IT corridor with intense directional surges and known choke points | office exit demand, wrong-side movement, merges, U-turns, infrastructure gaps | distributed corridor rather than a single stable junction | OSM is useful; local road conditions require extensive capture | 5 | 8.3 | Phase 2 corridor twin |
| Chandni Chowk | strategic highway/city gateway with major grade separation and pedestrian safety issues | high-speed merges, service-road interactions, pedestrian access, ramp behavior | large multi-level network with ramp topology | good OSM coverage; field validation is essential | 4 | 7.7 | Phase 2 advanced twin |
| Katraj Chowk | southern gateway with mixed local/highway and transit demand | merges, turn movements, heavy vehicle interactions, corridor spillback | broad network and potentially complex grade separation | good base mapping; high modeling effort | 5 | 7.4 | Phase 2 candidate |
| Wakad Junction / Bhumkar-Bhujbal area | growth corridor linking Wakad and Hinjawadi with recurring office-peak pressure | merges, service roads, access friction, encroachment, peak demand | corridor cluster with jurisdictional and geometry variation | useful OSM base; requires survey effort | 5 | 7.5 | Phase 2 candidate |
| Aundh | mixed office, education and residential flows | school/office peaks, curb friction, pedestrian demand | manageable urban intersections; needs a specific selected node | good base mapping | 8 | 7.2 | reserve/validation-friendly twin |
| Hadapsar / Gadital | eastern radial corridor with heavy growth and flyover/roadwork sensitivity | work-zone capacity loss, bus/auto behavior, ramp merging, corridor queues | complex radial node; construction state changes quickly | good base mapping; high temporal volatility | 5 | 7.2 | Phase 2 candidate |
| Shivajinagar | dense transit and commercial area | bus/auto dwell, pedestrian conflicts, parking, signal coordination | high operational richness but a dense multi-node environment | good OSM base; more scope than MVP needs | 6 | 7.1 | future cluster |

## Why the Three Hero Twins Win

### Nal Stop Junction — Hero Twin 1

- **Importance:** recognizably congested, centrally accessible, and representative of Pune’s mixed traffic.
- **Traffic pattern:** morning and evening directional peaks; all-day friction from commercial, education, pedestrian and curb activity.
- **Primary causes:** lane-use imbalance, pedestrian interaction, auto/bus stopping, parking friction, phase allocation, two-wheeler behavior.
- **Operational characteristics:** compact enough to field count repeatedly; rich enough for multiple cause and intervention narratives.
- **Digital-twin suitability:** high; a bounded geographic extent can model relevant approaches and queues.
- **Simulation complexity:** manageable if the flyover/metro geometry is explicitly scoped and only relevant movements are represented.

### University Circle / SPPU Square — Hero Twin 2

- **Importance:** one of Pune’s significant western-central connections, serving directional demand between institutional, office and residential zones.
- **Traffic pattern:** strong peak directional traffic and changing operations due to flyover/metro integration.
- **Primary causes:** ramp/merge behavior, phase and restriction changes, turning conflicts, pedestrian crossing demand, construction or transition effects.
- **Operational characteristics:** demonstrates VayuGati’s ability to model a modernizing, multi-level junction rather than only a conventional crossroads.
- **Digital-twin suitability:** high after a detailed field survey establishes the exact operational configuration used by the model.
- **Simulation complexity:** medium-high; make this a curated “premium” twin with a fixed validated geometry version.

### Swargate / Jedhe Chowk — Hero Twin 3

- **Importance:** a city-scale public transport and pedestrian interchange, not only a private-vehicle junction.
- **Traffic pattern:** all-day bus/auto/two-wheeler activity with strong commuter and terminal-linked demand.
- **Primary causes:** dwell and curb friction, auto staging, pedestrian crossings, turning and lane-allocation conflict, event/construction disruption.
- **Operational characteristics:** makes the platform’s public-transit, safety and equity dimensions visible.
- **Digital-twin suitability:** high with explicit terminal boundary, bus stop, pedestrian and curb-zone modeling.
- **Simulation complexity:** medium; the first release should model the immediate node and terminal interface, not the entire Swargate district.

## Source Qualification Notes

The congestion descriptions are planning hypotheses informed by publicly reported recurring issues and must be field-verified before being presented as operational fact. Relevant public references include reports on University Square’s chronic congestion and evolving grade separation, Swargate’s bus/auto/pedestrian conditions, Hinjawadi’s documented choke points, and Chandni Chowk’s high-volume highway/pedestrian context. They are discovery inputs, not substitute traffic datasets.

---

# 3. Scenario Library Design

## Design Rule

A scenario is reusable configuration, not a hard-coded frontend demo label.

```text
ScenarioTemplate
  = demand profile
  + event modifiers
  + operational constraints
  + observation requirements
  + intervention applicability
  + simulation horizon
```

## Core Scenario Templates

| Scenario | Demand/event model | Primary causes explored | Applicability |
|---|---|---|---|
| Morning Peak | directional commuter arrival increase | phase imbalance, school/office flows, queue spillback | all twins |
| Evening Peak | outbound/inbound commuter surge by hotspot | signal allocation, merge friction, curb blocking | all twins |
| School Traffic | timed pedestrian, auto and parent-vehicle activity | crossing interference, pickup/drop-off curb occupation | Nal Stop, Aundh and applicable local nodes |
| Office Exit Surge | sharp directional surge and two-wheeler share | turn conflict, spillback, access friction | University Circle, Hinjawadi, Wakad |
| Accident Blocking Lane | temporary capacity reduction and incident response | lane blockage, diversion, emergency access | all twins |
| Bus Stop Spillback | extended dwell and curb-lane blockage | transit dwell, lane drop, pedestrian conflict | Swargate, Nal Stop, Hadapsar |
| Illegal Parking | curb capacity reduction and visibility constraint | parking enforcement, lane blockage | Nal Stop, Swargate, Aundh |
| Rain | lower speed, longer headway, reduced capacity | safety risk, slower discharge, waterlogging where observed | all twins |
| Road Work | lane closure, diversion, temporary signal plan | work-zone capacity loss, merge friction | University Circle, Hadapsar, Chandni Chowk |
| VIP Movement | controlled closure or temporary priority corridor | diversion effects, queue propagation, emergency routing | selected twins only, clearly synthetic unless authorized data exists |
| Festival Traffic | time-bounded pedestrian/vehicle surge | crowd crossings, parking, temporary curb use | Swargate and city-center future twins |
| Emergency Vehicle Priority | emergency path request through a saturated node | phase pre-emption, queue clearing, safety | all twins |

## Scenario Parameters

```text
Time window and day type
Approach arrival rates
Turning-movement matrix
Vehicle-class composition
Bus frequency and dwell distribution
Pedestrian arrival distribution
Parking/curb occupancy
Weather/capacity modifier
Incident lane closure and duration
Signal-control plan
Random seed and variance model
```

## Minimum Scenario Coverage for MVP

| Twin | Required scenarios |
|---|---|
| Nal Stop | morning peak, evening peak, bus/auto curb friction, illegal parking, rain, emergency priority |
| University Circle | morning peak, office exit surge, road work/transition, incident lane blockage, emergency priority |
| Swargate | morning peak, evening peak, bus-stop spillback, pedestrian surge, illegal parking, emergency priority |

---

# 4. Field Validation Playbook

## Validation Objective

Turn local product-owner knowledge into attributable, reviewable digital-twin evidence without misrepresenting personal observation as official traffic data.

## Provenance Vocabulary

| Label | Meaning | Example |
|---|---|---|
| **Observed** | directly captured during a dated site visit or authorized sensor feed | four through lanes visible on northbound approach at 18:10 |
| **Derived** | calculated from observed data | 15-minute arrival rate derived from manual count |
| **Modeled** | engineering representation chosen to approximate reality | saturation-flow parameter for a lane group |
| **Synthetic** | generated input based on documented rules or scenarios | rain-day demand multiplier |
| **Simulated** | output produced by a named simulator, network, demand and intervention version | queue reduction from SUMO run `SIM-...` |

## Field Visit Protocol

### Before the Visit

1. Select twin version and target scenario window.
2. Print or load the OSM/PMC base geometry offline.
3. Prepare observation sheets for lanes, movements, signals, curb use, pedestrian crossings and bus operations.
4. Confirm safety boundaries; do not stand in carriageways or obstruct traffic.
5. Assign capture IDs for every photo, video and count sheet.

### At the Site

| Observation | Minimum capture |
|---|---|
| Road geometry | approach photos from safe public positions; sketch deviations from base map |
| Lanes | count by approach, permitted movements, approximate widths and active obstructions |
| Turning movements | 15-minute classified counts for at least one peak period |
| Signals | phase order, observed green/amber/red timing, cycle estimates, manually controlled behavior |
| Queues | queue length by lane/movement at defined sample intervals |
| Vehicle mix | two-wheeler, car, auto, bus, goods vehicle, emergency vehicle counts |
| Bus activity | stop position, dwell samples, re-entry behavior, spillback condition |
| Parking/curb use | location, duration, lane capacity effect |
| Pedestrians | crossing location, crossing volume, compliance, conflict observations |
| Risk/conflict points | location, time, movement combination, evidence reference |

### After the Visit

1. Upload observations to a source register.
2. Geo-reference evidence where possible.
3. Update twin geometry only through a reviewed change record.
4. Convert counts into derived demand profiles.
5. Create explicit assumptions for every missing parameter.
6. Run baseline simulation.
7. Compare simulated queues, travel time and behavior with observations.
8. Record acceptance or required calibration changes.

## Validation Acceptance Criteria

A premium twin is **Validated** only when:

- all modelled approaches have a current field-photo reference;
- lane and movement configuration is reviewed;
- signal sequence is observed or explicitly marked assumed;
- one peak-period classified count is recorded for the primary scenario;
- curb, bus and pedestrian layers are checked;
- every source has owner, capture date and license/permission state;
- modeled assumptions are separated from observed facts.

A twin is **Calibrated** only when the baseline run falls within an agreed engineering range for observed queue, travel time, and discharge behavior. The acceptance range and reviewer must be recorded per scenario.

## Future Drone Imagery

Drone imagery is a future validation enhancer, not an MVP dependency. Before use, obtain aviation permissions, property permissions, privacy review, and a retention policy. Store derived geometry rather than distributing raw imagery unless rights and policy permit it.

---

# 5. Pune Data Sources and Suitability

## Source Register

| Source | What it provides | Licensing/completeness/update considerations | MVP suitability |
|---|---|---|---|
| OpenStreetMap | roads, intersections, signal/crossing/bus-stop tags, land-use context | ODbL attribution required; lane/signal detail is uneven; extract and host a bounded copy rather than rely on public runtime APIs | **High** base geometry |
| PMC Open Data Portal | official Pune datasets and portal policy | dataset-specific license, schema and refresh must be reviewed; portal endorses India’s NDSAP approach but each asset needs verification | **High** source discovery and civic layers |
| PMC road centerline data | local road centerline reference | useful cross-check to OSM; confirm temporal coverage, license and geometric precision before redistribution | **High** geometry validation |
| PMRDA data catalog/GIS portal | metropolitan administrative, planning, infrastructure and spatial context | strong regional context; determine downloadable formats, terms and refresh per layer | **Medium-high** for University/Hinjawadi-region context |
| Maharashtra SDB / MRSAC resources | state-level GIS and road-reference discovery | varied terms, formats and maintenance; validate authoritative status per layer | **Medium** supplemental context |
| National OGD / Smart Cities portal | PMC/PMRDA catalogs and national data discovery | NDSAP-released catalog entries are promising but still need dataset-level review | **Medium** supporting layers |
| Academic transportation sources | local methodology, mixed-traffic models, historical studies | verify reuse rights and geographic relevance; studies are calibration references, not live data | **Medium** methodology/calibration |
| IIT Bombay mixed-traffic tools/research | heterogeneous mixed-traffic modelling and video count/trajectory methods | separate software/data licensing review; useful for Indian traffic modeling insight | **Medium-high** calibration support |
| Product-owner field observations | lane counts, photos, videos, signal timings, curb and pedestrian behavior | owner must record date, place, permission, safety and privacy constraints | **High** twin validation |

## Data Source Recommendations

### OpenStreetMap

Use OSM as the initial road and feature network. Display required attribution and publish a source/derived-data notice. OSM is not sufficient as the final lane and signal truth; field validation is mandatory for premium twins.

### PMC and PMRDA

Use the official PMC portal and PMRDA catalog/GIS services as the first source-discovery route for local roads, planning, administrative boundaries, public facilities, and relevant civic layers. Data availability, terms, accuracy and refresh cadence differ by dataset; record this at ingestion time rather than assuming all portal data is equally open or current.

### Survey of India

Use Survey of India references only for authoritative geodetic/contextual orientation where licensing and access permit. Do not copy restricted map products into a distributable demo package without explicit rights. It is not the primary detailed-road source for this MVP.

### National and Maharashtra Open Data

Use national OGD, Smart Cities, Maharashtra SDB and MRSAC catalogues as discovery and reference sources. Prefer official downloadable, attributable datasets with known dates and terms. Avoid treating catalogue presence as proof of operational freshness.

### Academic Sources

Use studies and Indian mixed-traffic methodologies to guide demand calibration, vehicle mix, car-following assumptions and validation practice. They do not replace current local field observation.

### Google Maps Restriction

Google Maps may be used only as a public discovery aid for place names or generally known congestion locations. Do not scrape, ingest, replay, redistribute, or claim use of Google proprietary traffic, travel-time, map-tile, or routing data without an appropriate commercial license and legal review.

## Public References Consulted for Strategy Discovery

- [Pune Municipal Corporation Open Data Portal](https://opendata.pmc.gov.in/)
- [PMC Open Data Policy](https://opendata.pmc.gov.in/open-data-policy)
- [Pune Road Centerline Map](https://data.opencity.in/dataset/pune-road-centerline-map)
- [PMRDA catalog on India OGD](https://www.data.gov.in/catalog/pune-metropolitan-region-development-authority)
- [PMRDA Development Plan](https://www.pmrda.gov.in/en/development-plan/)
- [OpenStreetMap copyright and license](https://www.openstreetmap.org/copyright)
- [IIT Bombay Traffic Data Extractor](https://www.civil.iitb.ac.in/tvm/tde2/)
- [IIT Bombay SiMTraM mixed-traffic simulation](https://www.civil.iitb.ac.in/tvm/SiMTraM_Web/html/index.html)

---

# 6. Premium Twin Implementation Order

## Twin 1 — Nal Stop

1. Field survey and geometry correction.
2. Define morning/evening base demand and curb-friction scenarios.
3. Build SUMO node and validate baseline behavior.
4. Simulate signal optimization, curb/parking enforcement, and emergency priority.
5. Build full replay and decision story.

## Twin 2 — University Circle

1. Freeze a field-verified infrastructure-state version.
2. Capture current lane/ramp/restriction operation.
3. Model office-directional demand and transition/road-work scenario.
4. Simulate signal/movement-management alternatives.
5. Add multi-level context to the replay only where it affects operational movement.

## Twin 3 — Swargate

1. Set a bounded model extent around Jedhe Chowk, terminal interface and key crossings.
2. Capture bus/auto staging, dwell and pedestrian activity.
3. Build bus-spillback and pedestrian-surge scenarios.
4. Simulate curb management, priority and crossing-management options.
5. Use this twin to demonstrate transit and safety-aware decision support.

## Expansion Gate

Do not begin a fourth twin until all three have:

```text
Validated geometry
Calibrated baseline
At least five scenario templates
Three comparable intervention runs per hero scenario
Complete provenance manifest
Replay approved by product and engineering review
```

---

# 7. Product Narrative

Use this language in demos and documentation:

> VayuGati Flow is an AI-powered Urban Decision Intelligence Platform beginning with a curated Digital Twin Library of Pune. Each library twin is field-validated, scenario-driven, evidence-backed, and simulation-ready.

Do not use this language:

> Here is a dashboard showing Pune traffic.

The product story is not visualization. It is a traceable decision loop from a named Pune intersection to a recommended intervention and replayable operational outcome.
