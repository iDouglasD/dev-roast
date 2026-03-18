# Leaderboard Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static leaderboard page with a server-rendered page that fetches the top 20 worst-scored roasts from the database via tRPC.

**Architecture:** Async server component with Suspense. New `top20` tRPC procedure mirrors the existing `top3` pattern. Card layout built inline with `tv()` variants (same as `homepage-leaderboard.tsx`), composing `LeaderboardCodePreview` and `CodeBlock.Body` for collapsible syntax-highlighted code.

**Tech Stack:** Next.js 15 (App Router, Server Components), tRPC, Drizzle ORM (Postgres), Tailwind CSS + tailwind-variants, Shiki (syntax highlighting), @base-ui/react (collapsible)

**Spec:** `docs/superpowers/specs/2026-03-18-leaderboard-page-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/trpc/routers/leaderboard.ts` | Modify | Add `top20` procedure |
| `src/components/leaderboard-skeleton.tsx` | Create | Suspense fallback skeleton for the leaderboard page |
| `src/app/leaderboard/page.tsx` | Rewrite | Server component with real data, verdict badges, roast comments, collapsible code |

---

### Task 1: Add `top20` tRPC procedure

**Files:**
- Modify: `src/trpc/routers/leaderboard.ts`

- [ ] **Step 1: Add the `top20` procedure to the leaderboard router**

Add a new procedure after the existing `top3` procedure. It follows the exact same pattern but selects more fields and limits to 20.

```typescript
top20: baseProcedure.query(async ({ ctx }) => {
  return ctx.db
    .select({
      id: roasts.id,
      score: roasts.score,
      code: roasts.code,
      language: roasts.language,
      lineCount: roasts.lineCount,
      verdict: roasts.verdict,
      roastComment: roasts.roastComment,
    })
    .from(roasts)
    .orderBy(asc(roasts.score), desc(roasts.createdAt))
    .limit(20);
}),
```

- [ ] **Step 2: Verify the dev server compiles without errors**

Run: `pnpm dev` (check terminal for compilation errors)
Expected: No TypeScript errors. The procedure should compile — all fields exist in the `roasts` schema and `asc`/`desc` are already imported.

- [ ] **Step 3: Commit**

```bash
git add src/trpc/routers/leaderboard.ts
git commit -m "feat(trpc): add top20 leaderboard procedure"
```

---

### Task 2: Create leaderboard skeleton component

**Files:**
- Create: `src/components/leaderboard-skeleton.tsx`

Reference: `src/components/homepage-leaderboard-skeleton.tsx` — follow the same `tv` pulse pattern but adapt to the full page layout (hero + 5 card skeletons with meta + comment + code + trigger sections).

- [ ] **Step 1: Create the skeleton component**

```tsx
import { tv } from "tailwind-variants";

const pulse = tv({
  base: "inline-block animate-pulse rounded bg-bg-elevated align-middle",
});

function LeaderboardSkeleton() {
  return (
    <div className="flex w-full max-w-leaderboard flex-col gap-10 px-10 py-10">
      {/* Hero skeleton */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-3xl font-bold text-accent-green">
            {">"}
          </span>
          <h1 className="font-mono text-3xl font-bold text-text-primary">
            shame_leaderboard
          </h1>
        </div>
        <p className="font-mono text-sm text-text-secondary">
          {"// the most roasted code on the internet"}
        </p>
        <div className="flex items-center gap-2">
          <span className={pulse({ class: "h-3 w-24" })} />
          <span className="text-text-tertiary">·</span>
          <span className={pulse({ class: "h-3 w-32" })} />
        </div>
      </section>

      {/* Card skeletons */}
      <section className="flex flex-col gap-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="overflow-hidden border border-border-primary">
            {/* Meta row skeleton */}
            <div className="flex items-center justify-between bg-bg-surface px-5 py-3">
              <div className="flex items-center gap-4">
                <span className={pulse({ class: "h-3 w-6" })} />
                <span className={pulse({ class: "h-3 w-10" })} />
                <span className={pulse({ class: "h-3 w-24" })} />
              </div>
              <div className="flex items-center gap-3">
                <span className={pulse({ class: "h-3 w-16" })} />
                <span className={pulse({ class: "h-3 w-12" })} />
              </div>
            </div>

            {/* Roast comment skeleton */}
            <div className="border-b border-border-primary bg-bg-surface px-5 py-3">
              <span className={pulse({ class: "h-3 w-3/4" })} />
            </div>

            {/* Code block skeleton */}
            <div className="flex flex-col gap-2 bg-bg-input px-5 py-4">
              <span className={pulse({ class: "h-3 w-3/4" })} />
              <span className={pulse({ class: "h-3 w-1/2" })} />
              <span className={pulse({ class: "h-3 w-2/3" })} />
            </div>

            {/* Expand trigger skeleton */}
            <div className="flex justify-center border-t border-border-primary bg-bg-surface py-2">
              <span className={pulse({ class: "h-3 w-20" })} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export { LeaderboardSkeleton };
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm dev` (check terminal)
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/leaderboard-skeleton.tsx
git commit -m "feat(ui): add leaderboard page skeleton component"
```

---

### Task 3: Rewrite leaderboard page with real data

**Files:**
- Rewrite: `src/app/leaderboard/page.tsx`

This is the main task. The page becomes an async server component that fetches data via `caller` and renders cards inline using `tv()` variants, reusing `LeaderboardCodePreview` and `CodeBlock.Body`.

Reference files:
- `src/components/homepage-leaderboard.tsx` — card layout pattern, `toShikiLang`, `tv()` variants
- `src/components/leaderboard-code-preview.tsx` — collapsible code wrapper
- `src/components/ui/badge.tsx` — Badge component (variants: `critical`, `warning`, `good`)
- `src/components/ui/code-block.tsx` — `CodeBlock.Body` for syntax highlighting

- [ ] **Step 1: Rewrite the page**

```tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import type { BundledLanguage } from "shiki";
import { tv } from "tailwind-variants";
import { LeaderboardCodePreview } from "@/components/leaderboard-code-preview";
import { LeaderboardSkeleton } from "@/components/leaderboard-skeleton";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { caller } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Shame Leaderboard — Dev Roast",
  description:
    "The most roasted code on the internet, ranked by shame. See the worst scores and learn what not to do.",
};

// --- Helpers ---

function toShikiLang(language: string): BundledLanguage {
  if (language === "other") return "text" as BundledLanguage;
  return language as BundledLanguage;
}

const VERDICT_BADGE_VARIANT = {
  needs_serious_help: "critical",
  try_harder: "critical",
  not_terrible: "warning",
  almost_decent: "warning",
  mass_respect: "good",
} as const;

function formatVerdict(verdict: string): string {
  return verdict.replace(/_/g, " ");
}

// --- Variants ---

const cardVariants = tv({
  base: "overflow-hidden border border-border-primary",
});

const metaVariants = tv({
  base: "flex items-center justify-between bg-bg-surface px-5 py-3 font-mono text-xs",
});

const rankVariants = tv({
  base: "text-text-secondary",
  variants: {
    first: {
      true: "font-bold text-accent-amber",
    },
  },
});

const commentVariants = tv({
  base: "border-b border-border-primary bg-bg-surface px-5 py-3 font-mono text-xs text-text-secondary",
});

// --- Page ---

export default function LeaderboardPage() {
  return (
    <main className="flex flex-1 flex-col items-center">
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardContent />
      </Suspense>
    </main>
  );
}

async function LeaderboardContent() {
  const [entries, stats] = await Promise.all([
    caller.leaderboard.top20(),
    caller.leaderboard.stats(),
  ]);

  return (
    <div className="flex w-full max-w-leaderboard flex-col gap-10 px-10 py-10">
      {/* Hero Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-3xl font-bold text-accent-green">
            {">"}
          </span>
          <h1 className="font-mono text-3xl font-bold text-text-primary">
            shame_leaderboard
          </h1>
        </div>
        <p className="font-mono text-sm text-text-secondary">
          {"// the most roasted code on the internet"}
        </p>
        <div className="flex items-center gap-2 font-mono text-xs text-text-tertiary">
          <span>{stats.totalRoasts.toLocaleString()} submissions</span>
          <span>·</span>
          <span>avg score: {stats.avgScore}/10</span>
        </div>
      </section>

      {/* Leaderboard Entries */}
      <section className="flex flex-col gap-5">
        {entries.length === 0 ? (
          <p className="py-10 text-center font-mono text-sm text-text-tertiary">
            {"// no submissions yet — the code out there must be perfect"}
          </p>
        ) : (
          entries.map((row, i) => (
            <div key={row.id} className={cardVariants()}>
              {/* Meta row */}
              <div className={metaVariants()}>
                <div className="flex items-center gap-4">
                  <span className={rankVariants({ first: i === 0 })}>
                    #{i + 1}
                  </span>
                  <span className="font-bold text-accent-red">
                    {row.score.toFixed(1)}
                  </span>
                  <Badge
                    variant={VERDICT_BADGE_VARIANT[row.verdict]}
                  >
                    {formatVerdict(row.verdict)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-secondary">{row.language}</span>
                  <span className="text-text-tertiary">
                    {row.lineCount} {row.lineCount === 1 ? "line" : "lines"}
                  </span>
                </div>
              </div>

              {/* Roast comment */}
              <div className={commentVariants()}>
                {"// \""}{row.roastComment}{"\""}
              </div>

              {/* Code block with collapsible */}
              <LeaderboardCodePreview>
                <CodeBlock.Body
                  code={row.code}
                  lang={toShikiLang(row.language)}
                  showLineNumbers
                />
              </LeaderboardCodePreview>
            </div>
          ))
        )}
      </section>

      {/* Footer */}
      <p className="text-center font-mono text-xs text-text-tertiary">
        showing top {entries.length} of {stats.totalRoasts.toLocaleString()}{" "}
        submissions
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page compiles and renders**

Run: `pnpm dev` then navigate to `http://localhost:3000/leaderboard`
Expected: Page renders with real data from the database. If no roasts exist, the empty state message should appear. Verify:
- Hero section shows real stats
- Cards show rank, score, verdict badge, roast comment, and collapsible code
- Expand/collapse toggle works on each card
- Syntax highlighting renders correctly

- [ ] **Step 3: Commit**

```bash
git add src/app/leaderboard/page.tsx
git commit -m "feat(leaderboard): rewrite page with real data from tRPC"
```
