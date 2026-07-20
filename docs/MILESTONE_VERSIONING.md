---
title: VayuGati Flow — Milestone Versioning
created: 2026-07-20
author: Devin
status: Active
purpose: Define mandatory annotated Git-tag and release-note governance for significant repository milestones.
---

# VayuGati Flow — Milestone Versioning

## Policy

Every significant VayuGati Flow milestone must be versioned with an **annotated Git tag** and pushed to GitHub. A milestone is not complete until both its commit and annotated tag are pushed to `origin`.

## What Requires a Milestone Tag

- Major architectural changes.
- Product strategy pivots.
- New MVP phases.
- Stable feature sets.
- Production-ready releases.
- Significant documentation baselines.
- Major AI or simulation-engine integrations.

Minor bug fixes, refactoring, and routine documentation edits do not require a milestone tag.

## Required Workflow

1. Complete implementation.
2. Verify applicable tests and documentation.
3. Commit the changes.
4. Create an annotated Git tag.
5. Push the commit.
6. Push the Git tag.
7. Publish the milestone release notes.

```bash
git tag -a <tag-name> -m "<milestone summary>"
git push origin <branch>
git push origin <tag-name>
```

## Tag Naming

Use semantic versioning with an optional descriptive suffix.

```text
v0.1.0-foundation
v0.2.0-product-strategy
v0.3.0-digital-twin
v0.4.0-simulation
v0.5.0-decision-engine
v0.9.0-beta
v1.0.0
```

Only annotated tags are permitted. Do not use lightweight tags for milestones.

## Release Notes

Every tagged milestone must provide:

- **Version**
- **Commit SHA**
- **Summary of changes**
- **Breaking changes**, if any
- **Next planned milestone**

The final milestone report must include:

```text
### Milestone Release

Version:
Commit:
Tag:
Status: Created / Pushed
```

If a tag has not been created or pushed, the report must explicitly state the reason and the outstanding action.

## Existing Product-Strategy Baseline

### Milestone Release

- **Version:** `v0.2.0-product-strategy`
- **Commit:** `13efc99`
- **Summary:** Pivoted the MVP from a Bengaluru-first narrative to a Pune-first, field-validated Digital Twin Library with premium hotspot selection, reusable scenarios, SUMO-based simulation strategy, provenance requirements, and a revised delivery roadmap.
- **Breaking changes:** None. This is a documentation and product-strategy change; no APIs or application code changed.
- **Next planned milestone:** `v0.3.0-digital-twin` after the first three Pune premium digital twins, field-validation manifests, scenario library, and simulation-ready asset contracts are implemented.
- **Tag:** `v0.2.0-product-strategy`
- **Status:** Created and pushed to `origin` on 2026-07-20.
