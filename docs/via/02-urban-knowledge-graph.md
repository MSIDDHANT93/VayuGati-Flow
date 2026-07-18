# 02-urban-knowledge-graph

- **Title:** URBAN KNOWLEDGE GRAPH
- **Purpose:** Define the canonical conceptual model of the urban environment for the VayuGati intelligence architecture.
- **Status:** Draft
- **Version:** 0.1.0
- **Author:** VayuGati Architecture Team
- **Last Updated:** 2026-07-18
- **Cross References:** [01-vision](01-vision.md), [03-agent-architecture](03-agent-architecture.md)

## 1. Purpose

The Urban Knowledge Graph (UKG) is the shared semantic model of the urban environment used by every intelligence component in VayuGati. It exists because effective reasoning, simulation, recommendation, and explanation require a single, coherent representation of the city rather than a collection of isolated datasets.

Urban operations currently rely on data that is captured, stored, and interpreted by different systems: cameras, signal controllers, maintenance logs, incident reports, weather services, and administrative records. Each system has its own vocabulary, identifiers, and assumptions. Without a unified model, an agent can detect that traffic is slow on one street while another agent has no concept of which intersection that street feeds into, or whether a nearby construction site is relevant.

The UKG resolves this by representing the city as a connected model of entities, relationships, evidence, and state. It does not replace underlying systems. It provides a common layer on which agents can reason, simulate, explain, and learn.

The UKG is therefore not a database, an index, or an API. It is the conceptual architecture of what the city is, from the perspective of VayuGati's intelligence layer.

## 2. Design Goals

| Goal | Explanation |
|---|---|
| **Single source of truth** | Every intelligence component refers to the same conceptual model of the urban environment. Disagreements between components are expressed as differences within the graph, not as incompatible data models. |
| **Shared understanding across agents** | Agents with different responsibilities observe, reason, and act using a common vocabulary of entities and relationships. |
| **Extensibility** | New domains, entity categories, and relationships can be added without restructuring the existing model. Traffic is the first domain, not the only domain. |
| **Traceability** | Every fact in the graph can be traced to the observations and assumptions that support it. |
| **Explainability** | Conclusions are explainable because the path from evidence to assertion is preserved in the model. |
| **Temporal awareness** | The graph represents not only the present city but also historical states, predicted states, and possible futures. |
| **Spatial awareness** | Every entity and relationship has spatial meaning, enabling reasoning about location, connectivity, proximity, and movement. |

## 3. Core Entity Categories

The UKG represents the city through a set of conceptual entity categories. Each category is a class of things the intelligence system needs to understand. The list below is not exhaustive, and future domains may introduce additional categories.

| Category | Description |
|---|---|
| **Infrastructure** | The physical built environment that shapes movement and activity, including roads, intersections, bridges, sidewalks, lanes, and buildings. |
| **Transportation** | The network of routes, links, corridors, and modes that connect places and carry people and goods. |
| **Traffic Control** | Devices and policies that regulate movement, such as signal controllers, signage, lane markings, priority rules, and timing plans. |
| **Sensors** | Sources of observation, including cameras, loop detectors, weather stations, GPS feeds, and crowd-sourced reports. |
| **Vehicles** | Moving objects that use the transportation network, such as cars, buses, trucks, and emergency vehicles. |
| **Pedestrians** | People moving through the urban environment on foot or using non-vehicular modes such as wheelchairs, bicycles, or scooters. |
| **Incidents** | Discrete events that disrupt normal operations, including accidents, construction, demonstrations, extreme weather, and public emergencies. |
| **Environmental Conditions** | External factors that affect traffic and operations, such as weather, air quality, lighting, and visibility. |
| **Administrative Regions** | Jurisdictional and organizational boundaries, including zones, districts, municipalities, patrol sectors, and facility management areas. |
| **Operational Assets** | Resources deployed to manage the city, including patrol units, tow trucks, ambulances, traffic personnel, and maintenance crews. |

These categories are intentionally conceptual. A single physical object may participate in multiple categories. A bus, for example, may be a vehicle, a sensor platform, and an operational asset simultaneously.

## 4. Relationships

Entities are meaningful because of how they relate. Relationships are first-class constructs in the UKG. They are not implicit or derived only at query time; they are part of the model that agents reason over.

The following relationship types are central to urban reasoning:

| Relationship | Meaning |
|---|---|
| **located_at** | An entity exists at or is associated with a particular place or region. |
| **connected_to** | Two infrastructure or transportation elements are directly linked, allowing movement or influence between them. |
| **controlled_by** | A traffic control element regulates or governs movement through an infrastructure or transportation element. |
| **observed_by** | A sensor or source provides evidence about the state of another entity. |
| **affects** | One entity has an influence on another, without implying direct causation. |
| **causes** | One entity or event is a direct causal factor for a change or condition in another. |
| **responded_by** | An operational asset or authority is assigned or dispatched to address an incident or condition. |
| **contains** | One region or entity spatially or administratively includes another. |
| **adjacent_to** | Two entities share a direct spatial boundary or near-neighbor relationship. |
| **depends_on** | One entity relies on another for its function, state, or existence. |

Relationships are directional and may carry their own evidence, temporal validity, and confidence. A relationship such as `causes` is only valid when there is supporting evidence and a plausible causal path. A relationship such as `affects` may express a weaker or more correlational connection.

## 5. Evidence Model

Every fact in the Urban Knowledge Graph must be backed by evidence. Evidence is the link between the model and the observable world. Without evidence, the graph is fiction. Without provenance, evidence cannot be trusted.

Evidence in the UKG may originate from:

- **Sensors** — physical devices that measure properties such as flow, speed, occupancy, or environmental conditions.
- **Cameras** — visual sensors that provide detections, classifications, and scene context.
- **Historical records** — past incidents, maintenance logs, signal timing plans, and operational outcomes.
- **External systems** — feeds from weather services, public transit authorities, navigation providers, emergency services, and municipal databases.
- **Human observations** — reports from operators, field personnel, citizens, or public officials.

Each piece of evidence is associated with:

- **Confidence** — a measure of how strongly the evidence supports the assertion.
- **Provenance** — the source, processing path, and transformations that produced the evidence.
- **Timestamp** — when the evidence was captured and when it is considered valid.
- **Traceability** — the ability to link the assertion back through the evidence to its origin.

The evidence model must support multiple, possibly conflicting, pieces of evidence for the same fact. Uncertainty and contradiction are not anomalies; they are expected conditions that the reasoning layer must resolve.

## 6. Temporal Model

Cities are dynamic. A fact that is true at 08:00 may be false at 09:00. A road closed yesterday may be open today. A prediction about tomorrow may depend on assumptions about demand. The UKG must therefore represent knowledge across time.

The temporal model supports four kinds of state:

| State | Description |
|---|---|
| **Historical state** | What the city was at a previous point in time, used for analysis, training, and accountability. |
| **Current state** | What the city is now, used for real-time reasoning and decision support. |
| **Predicted state** | What the city is expected to be under a given set of assumptions and trends. |
| **Possible future state** | What the city could be under a specific intervention or scenario, used for simulation and counterfactual reasoning. |

Temporal reasoning is essential for root cause analysis, which must reconstruct sequences of events, and for simulation, which must project consequences into the future. The graph must support validity intervals, temporal ordering, and the distinction between observed, inferred, and hypothetical states.

## 7. Spatial Model

Every entity in the UKG has spatial meaning. Spatial reasoning is not an afterthought; it is a core capability that enables the system to understand proximity, reachability, containment, and movement.

The spatial model includes the following concepts:

| Concept | Description |
|---|---|
| **Location** | The geographic position or extent associated with an entity. |
| **Connectivity** | The directed or undirected links that allow movement or influence between locations. |
| **Distance** | A measure of separation along the transportation network or through geographic space. |
| **Containment** | The relationship between a region and the entities that fall within it. |
| **Movement** | The change in location of vehicles, pedestrians, or operational assets over time. |

Spatial reasoning allows the system to answer questions such as: which intersections are affected by a given incident? Which cameras observe the approaches to a given junction? Which response units can reach a location fastest? These questions are answered through the graph structure, not through ad hoc geometric calculations.

## 8. Knowledge Evolution

The UKG is a living model. It is not built once and frozen. It evolves as the city changes and as the system learns.

Examples of changes that update the graph include:

- New infrastructure, such as added lanes, new intersections, or new transit stops.
- Road closures and diversions due to construction, events, or emergencies.
- Signal timing plan updates or controller replacements.
- Policy changes, such as new priority rules, one-way schemes, or access restrictions.
- Incidents that temporarily alter capacity, demand, or connectivity.
- Maintenance activities that restore or modify infrastructure condition.

The architecture must support change detection, incremental updates, and conflict resolution. When two sources disagree about the state of the city, the graph must retain both assertions, with their respective evidence and confidence, until the reasoning layer resolves them. Historical knowledge must remain accessible even as the current model is updated.

## 9. Consumers

The Urban Knowledge Graph is a shared resource consumed by multiple intelligence components. Each component uses the graph in a different way, but all operate on the same underlying model.

| Consumer | How the UKG is used |
|---|---|
| **Observation and interpretation agents** | Ground raw detections and signals in the graph, turning observations into structured facts. |
| **Reasoning agents** | Traverse relationships and evidence to identify causes, conflicts, and opportunities. |
| **Root Cause Engine** | Reconstruct sequences of events and causal chains from the current and historical state of the graph. |
| **Simulation Engine** | Generate possible future states by applying interventions and dynamics to the current graph. |
| **Decision Intelligence** | Evaluate Courses of Action by their expected effects on entities and relationships in the graph. |
| **Operational Memory** | Store outcomes of past decisions and learn how the graph changes in response to interventions. |
| **Explainability** | Provide the evidence and reasoning paths that justify conclusions presented to operators. |
| **Future plugins** | Extend the model to new domains without altering the core architecture. |

Because all components share the UKG, explanations can refer to the same entities and relationships that the simulation and recommendation engines used. This alignment is what makes the system coherent and auditable.

## 10. Out of Scope

This chapter intentionally does not define:

- Database technologies or storage engines.
- Graph query languages or protocol interfaces.
- Serialization formats, schemas, or encoding rules.
- Indexing, partitioning, or caching strategies.
- API definitions or service contracts.
- Performance optimization, scaling, or replication.
- Concrete algorithms for reasoning, matching, or inference.

These concerns belong to later VIA chapters, the system architecture, and the engineering documentation. The UKG, as defined here, is the conceptual model of the city.

## 11. Cross References

- The foundational principles behind the UKG are defined in [01-vision](01-vision.md).
- Agent interaction patterns that consume and update the graph are described in [03-agent-architecture](03-agent-architecture.md).
- Causal reasoning over the graph is covered in [04-root-cause-engine](04-root-cause-engine.md).
- Counterfactual projection of graph states is addressed in [05-simulation-engine](05-simulation-engine.md).
- Memory and state retention are discussed in [06-operational-memory](06-operational-memory.md).
- Decision-making and Course of Action generation are defined in [07-decision-intelligence](07-decision-intelligence.md).
