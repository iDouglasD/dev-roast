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

## Design Source

Pencil file: `C:\Users\Douglas\Desktop\devroast.pen` (MCP)
All spacing, colors, typography, and layout decisions come from this file.

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, Navbar
│   ├── globals.css         # @theme inline tokens (colors, syn-*, diff-*, spacing)
│   ├── page.tsx            # Screen 1 — Homepage / Code Input
│   └── components/         # Showcase route
└── components/
    ├── navbar.tsx           # Navbar (server component)
    ├── code-editor.tsx      # Code editor with line numbers
    ├── roast-form.tsx       # Code input + toggle + submit
    └── ui/                  # Primitives (see ui/AGENTS.md)
        ├── AGENTS.md        # Component patterns & composition rules
        ├── button.tsx
        ├── badge.tsx
        ├── toggle.tsx
        ├── diff-line.tsx
        ├── analysis-card.tsx
        ├── code-block.tsx
        └── score-ring.tsx
```

## Global Conventions

- **Fonts**: JetBrains Mono (`font-mono`) everywhere. No IBM Plex, no Geist.
- **CSS tokens**: Define in `@theme inline` (rem units). Never use arbitrary bracket values when a utility or token exists.
- **Tailwind v4**: Important suffix is `!` not prefix (e.g. `text-code!`).
- **tv() mandatory**: Every component uses `tv()` for class merging — ui/ and feature components alike.
- **Named exports only**: No `export default` anywhere.
- **JSX comments**: Text starting with `//` must be wrapped in `{"// ..."}`.
- **Biome rules off**: `noDangerouslySetInnerHtml`, `noArrayIndexKey`.
- **Layout styles**: Applied via `className` at call site, never hardcoded inside components.
- **Validation**: `npx biome check .` + `npm run build` after changes.

## Component Patterns

See [`src/components/ui/AGENTS.md`](src/components/ui/AGENTS.md) for:

- tv() structure, forwardRef, displayName
- Composition pattern (Object.assign dot notation)
- When to use / not use composition
- Naming conventions and checklist

## Screens

| # | Name              | Route         | Status  |
|---|-------------------|---------------|---------|
| 1 | Code Input        | `/`           | Done    |
| 2 | Roast Results     | `/results`    | Pending |
| 3 | Shame Leaderboard | `/leaderboard`| Pending |
| 4 | OG Image          | —             | Pending |
