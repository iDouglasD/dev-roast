# OG Image for Roast Results

> Auto-generate an OpenGraph image for each roast result so shareable links display a rich embed on social platforms.

## Overview

- Each `/roast/[id]` page gets a unique OG image showing the score, verdict, language, and a truncated roast quote
- Image generated on-demand via a dedicated API route using Takumi (Rust-based JSX-to-image engine)
- Design follows the "Screen 4 - OG Image" frame from the Pencil file

## Stack Decisions

| Choice | Option | Rationale |
|--------|--------|-----------|
| Image engine | Takumi (`@takumi-rs/image-response`) | Rust-native, fast, built-in Tailwind parser via `tw` prop, PNG/WebP support, near drop-in `ImageResponse` API |
| Route pattern | `app/api/og/[id]/route.tsx` | Dedicated route handler, independent cache, testable via direct URL access |
| Output format | PNG | Universal crawler compatibility (Twitter, Discord, WhatsApp, Slack) |
| Primary font | JetBrains Mono (loaded via ArrayBuffer) | Project-wide font, used for logo/score/verdict/lang |
| Secondary font | N/A — JetBrains Mono used everywhere | Follows project convention: "JetBrains Mono everywhere" |

## Architecture

### Route: `GET /api/og/[id]`

```
Request → extract [id] param → query roast from DB (Drizzle direct)
  → not found? return 404
  → build JSX with roast data → Takumi ImageResponse (1200×630, PNG)
  → Cache-Control: public, max-age=86400
```

- Uses Drizzle directly (not tRPC) since this is a raw route handler
- Runtime: `nodejs` (required for Takumi native addon) — export `runtime = "nodejs"` explicitly
- Validate `[id]` is a valid UUID before querying; return plain 404 (`new Response(null, { status: 404 })`) for invalid or missing IDs
- Score is `real` (float) in the DB — round to 1 decimal place for display (e.g., `42.7`)

### Image Layout (1200×630px)

Based on Pencil frame "Screen 4 - OG Image":

```
+--------------------------------------------------+
|                                                  |
|              > devroast                          |
|                                                  |
|                 42                               |
|                /100                              |
|                                                  |
|            * needs_serious_help                  |
|                                                  |
|         lang: javascript - 7 lines               |
|                                                  |
|   "this code was written during a power..."      |
|                                                  |
+--------------------------------------------------+
```

- Canvas: `#0a0a0a` background, `#2a2a2a` 1px border
- Single column, centered vertically and horizontally
- Gap: 28px between elements, padding: 64px

### Elements (top to bottom)

1. **Logo row** — `>` green (#10b981, 24px, bold 700) + `devroast` white (#fafafa, 20px, weight 500) — JetBrains Mono, gap 8px
2. **Score row** — score number (160px, weight 800/ExtraBold) + `/100` (#4b5563, 56px, normal) — JetBrains Mono, aligned baseline
3. **Verdict row** — filled circle 12px + verdict text (20px, normal) — gap 8px
4. **Lang info** — `lang: {language} - {lineCount} lines` (#4b5563, 16px) — JetBrains Mono
5. **Roast quote** — truncated roastComment in quotes, centered, full width, JetBrains Mono (22px), #fafafa, line-height 1.5

### Score/Verdict Color Mapping

| Verdict | Color |
|---------|-------|
| `needs_serious_help` | `#ef4444` (red) |
| `try_harder` | `#ef4444` (red) |
| `not_terrible` | `#f59e0b` (amber) |
| `almost_decent` | `#f59e0b` (amber) |
| `mass_respect` | `#10b981` (green) |

Score number and verdict row (dot + text) share the same color.

### Metadata in `/roast/[id]/page.tsx`

Replace static `metadata` export with `generateMetadata`. Fetch roast data via `caller.roast.getById` (same pattern as the page — Next.js deduplicates the request).

Base URL resolution: use `metadataBase` set from `NEXT_PUBLIC_BASE_URL` env var in root layout, or read from `headers()` host as fallback.

```ts
og:image       → {baseUrl}/api/og/{id}
og:image:width → 1200
og:image:height→ 630
og:image:type  → image/png
twitter:card   → summary_large_image
twitter:image  → {baseUrl}/api/og/{id}
title          → dynamic (verdict + score)
description    → dynamic (truncated roast comment)
```

### Roast Quote Truncation

- Max ~120 characters
- Cut at last complete word before limit
- Append `...` if truncated
- Wrap in double quotes: `"text here..."`

### Fonts

- **JetBrains Mono:** store `.ttf` files in `src/assets/fonts/`, load once at module scope via top-level promises (not per-request) for performance (weights: 400, 500, 700, 800)

### Next.js Config

Add to `next.config.ts`:

```ts
serverExternalPackages: ["@takumi-rs/core"]
```

## New Dependencies

| Package | Purpose |
|---------|---------|
| `@takumi-rs/image-response` | JSX-to-PNG image generation |

## File Structure

```
src/
├── app/
│   ├── api/og/[id]/route.tsx    # NEW — OG image route handler
│   └── roast/[id]/page.tsx      # MODIFIED — static metadata → generateMetadata
├── assets/
│   └── fonts/                   # NEW — JetBrains Mono .ttf files
└── ...
next.config.ts                   # MODIFIED — add serverExternalPackages
```

## Implementation To-Dos

### Setup
- [ ] Install `@takumi-rs/image-response`
- [ ] Add `@takumi-rs/core` to `serverExternalPackages` in `next.config.ts`
- [ ] Add JetBrains Mono `.ttf` files to `src/assets/fonts/`

### Route Handler
- [ ] Create `src/app/api/og/[id]/route.tsx`
- [ ] Query roast by ID via Drizzle
- [ ] Build verdict-to-color mapping utility
- [ ] Build roast quote truncation utility
- [ ] Load JetBrains Mono fonts at module scope (top-level promises)
- [ ] Validate UUID param, return 404 for invalid/missing
- [ ] Export `runtime = "nodejs"` explicitly
- [ ] Render JSX matching Pencil design
- [ ] Return `ImageResponse` with PNG format and cache headers

### Metadata
- [ ] Convert `/roast/[id]/page.tsx` from static `metadata` to `generateMetadata`
- [ ] Fetch roast data via `caller.roast.getById` inside `generateMetadata`
- [ ] Resolve base URL from `NEXT_PUBLIC_BASE_URL` or `headers()` host
- [ ] Add `og:image`, `og:image:width`, `og:image:height`, `og:image:type`
- [ ] Add `twitter:card` and `twitter:image`
- [ ] Dynamic title and description based on roast data

### Testing
- [ ] Manual test: access `/api/og/{id}` directly in browser to verify image renders
- [ ] Manual test: share link on Discord/Twitter to verify embed displays correctly
- [ ] E2E test via Playwright MCP
