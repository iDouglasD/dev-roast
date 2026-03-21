# Dev Roast — Project Guide

AI code roasting app with a terminal/hacker aesthetic.

## Stack

- Next.js 16.1.6 (App Router, Turbopack)
- TypeScript, React 19
- Tailwind CSS v4 (`@theme inline` for tokens)
- tailwind-variants (`tv`) — all components, no direct `twMerge`
- Biome (lint + format, 2-space indent)
- Shiki (syntax highlighting, server-side)
- Base UI React (headless primitives)
- Drizzle ORM + PostgreSQL 16 (Docker)
- tRPC v11 + TanStack Query v5

## Design Source

Pencil file: `C:\Users\Douglas\Desktop\devroast.pen` (MCP)
All spacing, colors, typography, and layout decisions come from this file.

## File Structure

```
src/
├── app/                    # Routes, layouts, globals.css — see app/CLAUDE.md
│   ├── api/trpc/[trpc]/    # tRPC HTTP handler
│   └── globals.css         # @theme inline tokens (colors, spacing, typography)
├── components/
│   ├── ui/                 # Primitives — see ui/CLAUDE.md
│   └── ...                 # Feature / layout components
├── db/                     # Drizzle schema + client — see db/CLAUDE.md
├── lib/                    # Shared utilities — see lib/CLAUDE.md
└── trpc/                   # tRPC setup — see trpc/CLAUDE.md
```

## Global Conventions

- **Fonts**: JetBrains Mono (`font-mono`) everywhere. No IBM Plex, no Geist.
- **CSS tokens**: Define in `@theme inline` (rem units). Never use arbitrary bracket values when a utility or token exists.
- **Tailwind v4**: Important suffix is `!` not prefix (e.g. `text-code!`).
- **tv() mandatory**: Every component uses `tv()` for class merging — ui/ and feature components alike.
- **Named exports only**: No `export default` anywhere (Next.js pages/layouts are the sole exception — required by the framework).
- **JSX comments**: Text starting with `//` must be wrapped in `{"// ..."}`.
- **Biome rules off**: `noDangerouslySetInnerHtml`, `noArrayIndexKey`.
- **Layout styles**: Applied via `className` at call site, never hardcoded inside components.
- **Validation**: `npx biome check .` + `npm run build` after changes.
- **Path alias**: `@/*` maps to `src/*`. Always use `@/` for internal imports.

## Component Patterns

See [`src/components/ui/CLAUDE.md`](src/components/ui/CLAUDE.md) for:

- tv() structure, forwardRef, displayName
- Composition pattern (Object.assign dot notation)
- When to use / not use composition
- Naming conventions and checklist

## Layer-Specific Guides

| Directory | Guide | Covers |
|-----------|-------|--------|
| `src/app/` | [`app/CLAUDE.md`](src/app/CLAUDE.md) | App Router, layouts, pages, API routes |
| `src/components/ui/` | [`ui/CLAUDE.md`](src/components/ui/CLAUDE.md) | Primitive components, tv(), forwardRef |
| `src/db/` | [`db/CLAUDE.md`](src/db/CLAUDE.md) | Drizzle schema, enums, migrations, seed |
| `src/trpc/` | [`trpc/CLAUDE.md`](src/trpc/CLAUDE.md) | tRPC routers, context, server vs client |
| `src/lib/` | [`lib/CLAUDE.md`](src/lib/CLAUDE.md) | Shiki singleton, language registry |
| `specs/` | [`specs/CLAUDE.md`](specs/CLAUDE.md) | Feature spec format and conventions |

## Screens

| # | Name              | Route         | Status  |
|---|-------------------|---------------|---------|
| 1 | Code Input        | `/`           | Done    |
| 2 | Roast Results     | `/roast/[id]` | Pending |
| 3 | Shame Leaderboard | `/leaderboard`| Pending |
| 4 | OG Image          | —             | Pending |
