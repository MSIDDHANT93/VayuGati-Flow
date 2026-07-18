# VayuGati Flow — Contributing Guide

## Scope

This guide explains how to create, update, and review documentation and architecture decisions for VayuGati Flow. For code contributions, follow the style and commit conventions described here plus any language-specific standards in ackend/ and rontend/.

## Creating New Documentation

1. Identify the correct folder:
   - docs/prd/ for product requirements chapters.
   - docs/adr/ for architecture decision records.
   - docs/ root for cross-cutting guides (this file, style guide, system overview).
2. Copy the appropriate template or an existing file of the same type.
3. Fill in the metadata header exactly as defined in docs/STYLE_GUIDE.md.
4. Follow the heading hierarchy, table, and Mermaid conventions.
5. Open a pull request for review before merging.

## Updating Existing Chapters

1. Open the chapter and read the metadata header to confirm the current version and owner.
2. Make focused edits; avoid mixing formatting fixes with content changes.
3. If the change is substantive, increment the Version field and update Status to Review.
4. Add a ## Changelog entry if the minor or major version changes.
5. Verify that all internal links still resolve.

## Proposing Architectural Changes

All significant architectural or engineering decisions must be captured in an Architecture Decision Record (ADR):

1. Read docs/adr/README.md.
2. Create a new ADR using the next available number.
3. Discuss the ADR in a pull request before implementation.
4. Update affected PRD chapters or system documents with cross-references.

## Submitting Pull Requests

1. Branch from main with a descriptive name: docs/update-02-problem-domain or dr/websocket-real-time.
2. Keep changes small and focused on a single concern.
3. Fill in the PR template if one exists; otherwise, include:
   - What changed
   - Why it changed
   - Related issue or ADR
   - Reviewer focus areas
4. Ensure the Markdown renders correctly and internal links are valid.
5. Request review from the document owner or a maintainer.

## Writing Commit Messages

Use conventional commits for all changes:

`
<scope>: <short summary>
`

Common prefixes for documentation:

| Prefix | Use Case |
|---|---|
| docs: | General documentation updates. |
| docs(prd): | PRD chapter additions or edits. |
| docs(adr): | Architecture Decision Records. |
| ix(docs): | Broken links, typos, formatting. |
| efactor(docs): | Restructuring without content change. |

Examples:

`
docs(prd): populate 03-product-strategy.md
docs(adr): add ADR-004-websocket-real-time.md
fix(docs): correct broken cross-references in 02-problem-domain.md
`

## Maintaining Cross-References

- Every PRD chapter should reference related chapters where appropriate.
- ADRs must reference the requirements or problems they address.
- When renaming or deleting a file, update all links in the repository.
- Use a search for the file path before merging to avoid dead links.

## Review Culture

- Treat documentation as code: it is reviewed, versioned, and tested for consistency.
- Ask for clarity before merging ambiguity.
- Do not approve PRs that introduce unsupported claims, dead links, or inconsistent IDs.
