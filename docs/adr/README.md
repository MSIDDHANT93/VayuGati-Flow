# Architecture Decision Records (ADRs)

## Purpose

Architecture Decision Records (ADRs) capture the significant engineering and design decisions made during the development of VayuGati Flow. Each ADR explains the context, options considered, decision rationale, and consequences of a single architectural choice.

ADRs provide transparency for current and future contributors, prevent re-litigation of settled decisions, and help onboard engineers by documenting *why* the system is shaped the way it is.

## ADR Lifecycle

| Stage | Description | Status Field |
|---|---|---|
| **Proposed** | A new ADR is drafted and opened for discussion. | Proposed |
| **Accepted** | The ADR is approved and becomes a binding decision. | Accepted |
| **Deprecated** | The decision is no longer valid; a newer ADR supersedes it. | Deprecated |
| **Superseded** | A later ADR explicitly replaces this one. | Superseded by ADR-NNN |

## Required Sections

Every ADR must contain the following sections:

1. **Title** — Descriptive, decision-focused title.
2. **Status** — Current lifecycle stage.
3. **Context** — What problem or constraint prompted the decision?
4. **Decision** — The exact decision being recorded.
5. **Consequences** — Positive, negative, and neutral outcomes.
6. **Alternatives Considered** — Other options and why they were rejected (optional but recommended).
7. **References** — Related documents, issues, or ADRs.

## Naming Convention

Use the following pattern:

`
ADR-NNN-short-decision-name.md
`

- NNN is a zero-padded three-digit number.
- Use lowercase, kebab-case for the decision name.
- Reserve sequential numbers; do not reuse deprecated numbers.

## Examples

- ADR-001-api-first-architecture.md
- ADR-002-human-in-the-loop.md
- ADR-003-rest-api-first.md

## Contributing a New ADR

1. Check the docs/adr/ folder for the next available number.
2. Copy this structure or an existing ADR as a template.
3. Open a pull request titled docs(adr): add ADR-NNN-<name>.
4. Request review from the technical lead or a maintainer.
