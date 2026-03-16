# tRPC — Implementation Spec

> Type-safe API layer with tRPC v11, TanStack React Query, and Next.js App Router SSR integration.

---

## Overview

The project currently has hardcoded data in every page (`/`, `/roast/[id]`, `/leaderboard`). We need an API layer that:

- Exposes type-safe procedures for querying and mutating roast data
- Integrates with Next.js App Router for SSR prefetching in server components
- Uses TanStack React Query for client-side cache, mutations, and optimistic UI
- Connects to our existing Drizzle ORM + Postgres database

---

## Stack Decisions

| Concern | Choice | Rationale |
|---|---|---|
| API layer | tRPC v11 | End-to-end type safety, zero codegen, native React Query integration |
| Client integration | `@trpc/tanstack-react-query` | The recommended tRPC v11 client — produces `queryOptions` / `mutationOptions` for TanStack Query |
| SSR | `createTRPCOptionsProxy` + `HydrationBoundary` | Prefetch in server components, hydrate to client — no waterfalls |
| Validation | Zod | Already idiomatic with tRPC, validates all procedure inputs |
| Data transformer | None | We don't use `Date` objects or `Map`/`Set` in API responses — no need for superjson |

---

## Architecture

### File Structure

```
src/
├── trpc/
│   ├── init.ts              # initTRPC, context, base procedure
│   ├── client.tsx            # "use client" — TRPCProvider, useTRPC
│   ├── server.tsx            # "server-only" — prefetch helpers, HydrateClient
│   ├── query-client.ts       # makeQueryClient factory (shared server/client)
│   └── routers/
│       ├── _app.ts           # Root appRouter (merges sub-routers)
│       ├── roast.ts          # Roast procedures (getById, submit)
│       └── leaderboard.ts    # Leaderboard procedures (list, stats)
├── app/
│   ├── api/trpc/[trpc]/
│   │   └── route.ts          # Fetch adapter — GET + POST handlers
│   └── layout.tsx            # Wrap children with TRPCReactProvider
```

### Data Flow

```
Server Component                 Client Component
─────────────────                ─────────────────
prefetch(trpc.roast.getById...)  useSuspenseQuery(trpc.roast.getById...)
        │                                │
        ▼                                ▼
  getQueryClient()               hydrated from HydrationBoundary
        │                                │
        ▼                                ▼
  appRouter (direct call)        httpBatchLink → /api/trpc → appRouter
        │                                │
        ▼                                ▼
     Drizzle db                       Drizzle db
```

- **Server components** call the router directly (no HTTP round-trip) via `createTRPCOptionsProxy` with the router reference.
- **Client components** call via `httpBatchLink` to `/api/trpc/[trpc]` route handler.
- Both paths share the same query keys, so prefetched data hydrates seamlessly.

---

## tRPC Init & Context

File: `src/trpc/init.ts`

```typescript
import { initTRPC } from "@trpc/server";
import { cache } from "react";
import { db } from "@/db";

export const createTRPCContext = cache(async () => {
  return { db };
});

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
```

The context provides our Drizzle `db` instance. No auth since submissions are anonymous.

---

## Routers

### `roast` Router

File: `src/trpc/routers/roast.ts`

| Procedure | Type | Input | Description |
|---|---|---|---|
| `getById` | `query` | `z.object({ id: z.string().uuid() })` | Fetch a single roast with its issues and diff lines (for `/roast/[id]`) |
| `submit` | `mutation` | `z.object({ code: z.string().min(1).max(10000), language: z.enum([...]) })` | Submit code for roasting (placeholder until AI integration) |

**`getById` query** — Joins `roasts` + `roast_issues` + `roast_diff_lines` using Drizzle SQL-style queries (no `db.query`, as per project convention).

**`submit` mutation** — For now, inserts a mock roast with random score/verdict/issues. Will be replaced by AI generation later.

### `leaderboard` Router

File: `src/trpc/routers/leaderboard.ts`

| Procedure | Type | Input | Description |
|---|---|---|---|
| `list` | `query` | `z.object({ period: z.enum(["today", "week", "month", "all"]).default("all"), limit: z.number().min(1).max(100).default(50) })` | Fetch leaderboard entries sorted by worst score |
| `stats` | `query` | None | Aggregate stats: total submissions + average score |

### Root Router

File: `src/trpc/routers/_app.ts`

```typescript
import { createTRPCRouter } from "../init";
import { roastRouter } from "./roast";
import { leaderboardRouter } from "./leaderboard";

export const appRouter = createTRPCRouter({
  roast: roastRouter,
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;
```

---

## Query Client Factory

File: `src/trpc/query-client.ts`

```typescript
import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}
```

- `staleTime: 30s` — avoids immediate refetch after SSR hydration.
- `shouldDehydrateQuery` — also dehydrates pending queries so prefetch streaming works.

---

## Client Setup

File: `src/trpc/client.tsx`

The `"use client"` entrypoint exports:

- `TRPCProvider` / `useTRPC` — from `createTRPCContext<AppRouter>()`
- `TRPCReactProvider` — wrapper component that sets up `QueryClientProvider` + `TRPCProvider` with `httpBatchLink` pointing to `/api/trpc`

This provider is mounted in `src/app/layout.tsx` wrapping `{children}`.

---

## Server Setup

File: `src/trpc/server.tsx`

The `"server-only"` entrypoint exports:

- `getQueryClient` — `cache(makeQueryClient)` for per-request singleton
- `trpc` — `createTRPCOptionsProxy` bound to the router + context (direct calls, no HTTP)
- `prefetch(queryOptions)` — helper that calls `queryClient.prefetchQuery`
- `HydrateClient` — wrapper that renders `<HydrationBoundary state={dehydrate(queryClient)}>`
- `caller` — `appRouter.createCaller(createTRPCContext)` for direct server-side data access without cache

---

## API Route Handler

File: `src/app/api/trpc/[trpc]/route.ts`

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

---

## Page Integration Examples

### `/roast/[id]` (Server Component with prefetch)

```tsx
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { RoastResultContent } from "./roast-result-content"; // client component

export default async function RoastResultPage({ params }) {
  const { id } = await params;
  prefetch(trpc.roast.getById.queryOptions({ id }));

  return (
    <HydrateClient>
      <RoastResultContent id={id} />
    </HydrateClient>
  );
}
```

### `/leaderboard` (Server Component with prefetch)

```tsx
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { LeaderboardContent } from "./leaderboard-content"; // client component

export default async function LeaderboardPage() {
  prefetch(trpc.leaderboard.list.queryOptions({ period: "all" }));
  prefetch(trpc.leaderboard.stats.queryOptions());

  return (
    <HydrateClient>
      <LeaderboardContent />
    </HydrateClient>
  );
}
```

### Client Component consuming data

```tsx
"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function RoastResultContent({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data: roast } = useSuspenseQuery(trpc.roast.getById.queryOptions({ id }));
  // render roast data...
}
```

---

## New Dependencies

| Package | Type | Purpose |
|---|---|---|
| `@trpc/server` | runtime | Server-side router, procedures, context |
| `@trpc/client` | runtime | Client-side tRPC client (`httpBatchLink`) |
| `@trpc/tanstack-react-query` | runtime | React Query integration (`createTRPCContext`, `createTRPCOptionsProxy`) |
| `@tanstack/react-query` | runtime | Data fetching, caching, hydration |
| `zod` | runtime | Input validation for procedures |
| `server-only` | runtime | Ensures server files can't be imported from client |
| `client-only` | runtime | Ensures client files can't be imported from server |

---

## Layout Change

`src/app/layout.tsx` must wrap `{children}` with `TRPCReactProvider`:

```tsx
import { TRPCReactProvider } from "@/trpc/client";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

---

## Implementation To-Dos

### Infrastructure

- [ ] Install dependencies: `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`, `@tanstack/react-query`, `zod`, `server-only`, `client-only`
- [ ] Create `src/trpc/init.ts` — tRPC init, context with `db`, base procedure
- [ ] Create `src/trpc/query-client.ts` — `makeQueryClient` factory
- [ ] Create `src/trpc/client.tsx` — `"use client"` provider + `useTRPC`
- [ ] Create `src/trpc/server.tsx` — `"server-only"` prefetch helpers + `HydrateClient`
- [ ] Create `src/app/api/trpc/[trpc]/route.ts` — fetch adapter

### Routers

- [ ] Create `src/trpc/routers/_app.ts` — root router merging sub-routers
- [ ] Create `src/trpc/routers/roast.ts` — `getById` query, `submit` mutation
- [ ] Create `src/trpc/routers/leaderboard.ts` — `list` query, `stats` query

### Integration

- [ ] Wrap layout with `TRPCReactProvider` in `src/app/layout.tsx`
- [ ] Refactor `/roast/[id]` to prefetch + hydrate via tRPC
- [ ] Refactor `/leaderboard` to prefetch + hydrate via tRPC
- [ ] Refactor `/` homepage leaderboard preview to use tRPC data
- [ ] Wire `RoastForm` submit button to `trpc.roast.submit` mutation

### Validation

- [ ] `npx biome check .` passes
- [ ] `npm run build` passes
- [ ] Manual test: `/roast/[id]` loads data from DB
- [ ] Manual test: `/leaderboard` loads data from DB
- [ ] Manual test: submit code from homepage creates a roast and redirects to `/roast/[id]`
