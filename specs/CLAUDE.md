# specs/ — Feature Specification Guide

Write a spec **before** implementing any non-trivial feature. The spec is the single source of truth for what gets built.

## File naming

`kebab-case.md` matching the feature name. Examples: `drizzle.md`, `editor-highlight.md`, `roast-api.md`.

## Required sections

Every spec must include at minimum:

1. **Title + one-line summary** — `# Feature Name` with a `>` blockquote describing the goal.
2. **Overview** — What problem this solves and what it covers (bullet list).
3. **Stack decisions** — Libraries, tools, or approaches chosen with brief rationale. Use a table when comparing alternatives.
4. **Architecture / Schema / Design** — The core technical plan. Varies by feature type:
   - Data features: tables, enums, ERD, queries.
   - UI features: component tree, props, state flow.
   - Infra features: config files, services, file structure.
5. **Implementation to-dos** — Checkbox list (`- [ ]`) of concrete steps to execute, grouped by concern (infra, schema, components, validation, etc.).

## Optional sections (use when relevant)

- **Research findings** — When multiple approaches were evaluated. Include comparison tables with size, effort, tradeoffs.
- **Design mapping** — When the Pencil design file drives the spec. Map UI elements to data fields/components.
- **Key queries / API contracts** — Reference code blocks showing the main operations.
- **New dependencies** — Table of packages to install with version and purpose.
- **Open questions** — Unresolved decisions to discuss before or during implementation.
- **File structure** — Tree view of new/modified files.

## Conventions

- Keep specs **actionable** — someone should be able to implement from the spec alone.
- Reference the Pencil design file (`devroast.pen`) via MCP for any layout, spacing, or color decisions.
- Code blocks should be realistic, not pseudocode.
- Update the spec's to-do checkboxes as implementation progresses.
- A spec is **not** documentation — it can go stale after the feature ships.
