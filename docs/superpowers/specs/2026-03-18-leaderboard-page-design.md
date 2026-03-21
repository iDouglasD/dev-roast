# Leaderboard Page — Design Spec

## Overview

Replace the static/hardcoded leaderboard page with a fully functional server-rendered page that fetches the top 20 worst-scored roasts from the database via tRPC. Follows the same patterns established by the homepage shame leaderboard (collapsible code preview, syntax highlighting, server component with Suspense).

## Requirements

- Display 20 entries, ordered by lowest score first (hall of shame)
- No pagination — single static list
- Each entry shows: rank, score, language, line count, verdict badge, roast comment, and collapsible code with syntax highlighting
- Hero section displays real stats (total submissions, avg score) from `leaderboard.stats()`
- Server component with Suspense + skeleton fallback

## Backend

### New tRPC Procedure: `leaderboard.top20`

**File:** `src/trpc/routers/leaderboard.ts`

- No input parameters
- Selects: `id`, `score`, `code`, `language`, `lineCount`, `verdict`, `roastComment`
- Order: `asc(roasts.score)`, `desc(roasts.createdAt)` (reuses existing `idx_roasts_leaderboard` index)
- Limit: 20
- Returns array of roast objects

No schema changes needed — all required fields already exist in the `roasts` table.

## Frontend

### Page Component

**File:** `src/app/leaderboard/page.tsx`

Async server component that:

1. Calls `caller.leaderboard.top20()` and `caller.leaderboard.stats()` in parallel via `Promise.all`
2. Renders the page content

### Page Structure

```
<main>
  <Suspense fallback={<LeaderboardSkeleton />}>
    <LeaderboardContent />
  </Suspense>
</main>
```

The async data-fetching component (`LeaderboardContent`) is extracted so Suspense can wrap it properly.

### Card Approach

The page builds card layouts inline using `tv()` variants (same approach as `homepage-leaderboard.tsx`), NOT the `LeaderboardEntry` compound component — that component has a fixed-height code area and doesn't support verdict badges, roast comments, or collapsible code.

### Card Layout (per entry)

Each of the 20 entries follows this structure:

```
┌─────────────────────────────────────────────┐
│ Meta Row                                    │
│ #1  score: 1.2  [● needs_serious_help]      │
│                         javascript · 3 lines│
├─────────────────────────────────────────────┤
│ Roast Comment                               │
│ // "This code is a masterclass in..."       │
├─────────────────────────────────────────────┤
│ Code (collapsible, collapsed by default)    │
│ 1 │ eval(prompt("enter code"))              │
│ 2 │ document.write(response)                │
│   │ ░░░░ gradient fade ░░░░                 │
├─────────────────────────────────────────────┤
│           $ expand >>                       │
└─────────────────────────────────────────────┘
```

### Meta Row

Reuses the visual pattern from `HomepageLeaderboard` (tv variants for styling):
- Left side: rank (`#N`), score (bold red), verdict badge
- Right side: language, line count

### Verdict Badge

Uses existing `Badge` component with this mapping:

| Verdict             | Badge Variant | Color  |
|---------------------|---------------|--------|
| `needs_serious_help`| `critical`    | Red    |
| `try_harder`        | `critical`    | Red    |
| `not_terrible`      | `warning`     | Amber  |
| `almost_decent`     | `warning`     | Amber  |
| `mass_respect`      | `good`        | Green  |

Verdict labels are displayed formatted: `needs_serious_help` → `needs serious help`.

### Roast Comment Section

- Sits between meta row and code block
- Styled as a code comment: `// "{roastComment}"`
- Background: `bg-bg-surface`, monospace font, `text-text-secondary`
- Padding consistent with meta row

### Code Block (Collapsible)

Reuses existing components:
- `LeaderboardCodePreview` — collapsible wrapper with gradient fade and expand/collapse toggle
- `CodeBlock.Body` — Shiki syntax highlighting with line numbers

### Skeleton Component

**File:** `src/components/leaderboard-skeleton.tsx`

- Renders 5 skeleton cards with pulsing animations
- Matches the card structure (meta row + comment area + code area + trigger bar)
- Used as Suspense fallback

### Hero Section

Same layout as current page but with real data:
- Title: `> shame_leaderboard`
- Subtitle: `// the most roasted code on the internet`
- Stats: `{totalRoasts} submissions · avg score: {avgScore}/10`

### Footer

- Text: `showing top 20 of {totalRoasts} submissions`
- Centered, monospace, tertiary text color

## Empty State

If no roasts exist, display a placeholder message instead of the entry list: `// no submissions yet — the code out there must be perfect`.

## Metadata

Preserve the existing `metadata` export (title: "Shame Leaderboard — Dev Roast", description unchanged).

## Helper: `toShikiLang`

Duplicate the `toShikiLang` function from `homepage-leaderboard.tsx` in the page file (3-line function, not worth extracting to a shared module).

## Helper: `verdictToBadgeVariant`

Maps verdict enum to Badge component variant. Simple lookup object.

## Helper: `formatVerdict`

Replaces underscores with spaces for display: `needs_serious_help` → `needs serious help`.

## Files Changed

| File | Action |
|------|--------|
| `src/trpc/routers/leaderboard.ts` | Add `top20` procedure |
| `src/app/leaderboard/page.tsx` | Rewrite with real data fetching |
| `src/components/leaderboard-skeleton.tsx` | New skeleton component |

## Out of Scope

- Pagination or infinite scroll
- Client-side refetch or real-time updates
- Changes to the homepage leaderboard
- Changes to the `LeaderboardEntry` compound component
