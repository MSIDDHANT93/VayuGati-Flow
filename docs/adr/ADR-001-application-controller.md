# ADR-001: Adopt an Application Controller for Frontend Runtime Coordination

## Status

Accepted

## Context

The frontend dashboard had grown beyond static presentation. `App` owned pipeline requests, retry behavior, scenario changes, mission events, and state used by map and decision components. This coupled lifecycle, network coordination, and UI rendering, making scoped testing and future runtime integrations harder.

## Decision

Adopt `TrafficApp` as the application controller. It composes focused managers, owns an `AppContext` runtime state store, controls initialization and disposal, and coordinates module communication. React is retained as the rendering layer and subscribes to context snapshots through `useSyncExternalStore`.

## Alternatives Considered

### Keep orchestration in React components

Rejected because lifecycle and coordination would remain distributed across rendering components, increasing coupling as replay, reporting, and real-time feeds evolve.

### Adopt a global state framework

Rejected because the current application needs a small explicit runtime controller, not a new dependency or generalized state framework. `AppContext` provides the necessary observable state boundary.

### Use React Context alone

Rejected because React Context would distribute lifecycle decisions through providers and hooks rather than provide a testable non-UI orchestration boundary.

### Create a manager for every component

Rejected because it would add indirection without runtime ownership. Managers are limited to cohesive application concerns: layout, map state, data loading, events, simulation, reasoning, replay, and reporting.

## Consequences

### Positive

- Startup, lifecycle, and shared state have a single owner.
- Runtime interactions can be unit tested with injected dependencies.
- UI components remain focused on rendering and user intent.
- Real-time data, replay, reporting, and map adapters have explicit extension points.

### Tradeoffs

- `TrafficApp` is a composition root and must avoid accumulating domain behavior that belongs in a manager.
- Context updates require immutable snapshots to preserve React subscription correctness.
- Small application features may require touching both a manager and the UI adapter.

## Long-Term Maintainability

The controller isolates frontend runtime coordination from React implementation choices. Teams can evolve data transport, map integrations, report generation, or replay behavior behind focused managers without rewriting dashboard layout components. The explicit composition root also makes dependencies and startup order visible during onboarding and architectural review.

## References

- `docs/architecture/application-controller.md`
- `frontend/src/app/TrafficApp.tsx`
- `frontend/src/app/AppContext.ts`
