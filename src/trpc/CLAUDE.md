# tRPC Layer

Guia de referência para trabalhar com a camada de API em `src/trpc/`.

---

## Stack

- **tRPC v11** com `@trpc/tanstack-react-query`
- **TanStack Query v5** para cache e estado no cliente
- **`createTRPCOptionsProxy`** no servidor (sem HTTP — chamadas diretas ao router)
- **`httpBatchLink`** no cliente (via `/api/trpc`)

---

## Estrutura de Arquivos

```
src/trpc/
├── init.ts             # initTRPC, contexto, baseProcedure
├── query-client.ts     # makeQueryClient factory
├── client.tsx          # "use client" — TRPCProvider, useTRPC, useTRPCClient
├── server.tsx          # "server-only" — trpc proxy, HydrateClient, prefetch
└── routers/
    ├── _app.ts         # Root appRouter (agrega todos os sub-routers)
    └── leaderboard.ts  # Sub-router do leaderboard
```

---

## Inicialização (`init.ts`)

Define o contexto e os primitivos de roteamento. **Não modificar sem necessidade.**

```ts
import { initTRPC } from "@trpc/server";
import { cache } from "react";
import { db } from "@/db";

export const createTRPCContext = cache(async () => {
  return { db };
});

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
```

- O contexto expõe `db` (instância do Drizzle) para todos os procedures
- `cache()` do React garante que o contexto seja criado apenas uma vez por request
- Novos campos no contexto (ex: sessão de auth) devem ser adicionados aqui

---

## Query Client (`query-client.ts`)

```ts
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000 },
      dehydrate: { shouldDehydrateQuery: (q) => q.state.status === "pending" || ... },
    },
  });
}
```

- `staleTime: 30s` — evita refetch imediato em navegações client-side
- Não usar singleton no servidor (cada request precisa de um QueryClient novo)
- No cliente, usar singleton para preservar cache entre re-renders

---

## Servidor (`server.tsx`)

Arquivo marcado com `"server-only"` — **nunca importar em Client Components**.

```ts
import "server-only";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
  router: appRouter,
  ctx: createTRPCContext,
  queryClient: getQueryClient,
});

export function HydrateClient({ children }: { children: React.ReactNode }) { ... }
export function prefetch(queryOptions: any) { ... }
```

### Como usar no servidor (Server Components / RSC)

```tsx
// Prefetch para hidratar o cliente
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function Page() {
  prefetch(trpc.leaderboard.stats.queryOptions());

  return (
    <HydrateClient>
      <ClientComponent />
    </HydrateClient>
  );
}
```

- `prefetch()` executa a query no servidor e serializa o resultado
- `HydrateClient` envolve a árvore para passar o estado hidratado ao cliente
- O Client Component vai usar os dados pré-carregados sem nova requisição HTTP

---

## Cliente (`client.tsx`)

Arquivo marcado com `"use client"` — **nunca importar em Server Components**.

```tsx
"use client";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
```

### Como usar no cliente (Client Components)

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

function Stats() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.leaderboard.stats.queryOptions());
  return <span>{data?.totalRoasts}</span>;
}
```

### Provider

O `TRPCReactProvider` é montado em `src/app/layout.tsx` e engloba toda a aplicação. Não adicionar providers extras — tudo passa por este único provider.

---

## Routers

### Root Router (`routers/_app.ts`)

Agrega todos os sub-routers. Sempre adicionar novos routers aqui:

```ts
export const appRouter = createTRPCRouter({
  leaderboard: leaderboardRouter,
  // novoFeature: novoFeatureRouter,
});

export type AppRouter = typeof appRouter;
```

### Sub-routers

Um arquivo por domínio em `routers/`. Convenção de nomenclatura: `kebab-case.ts`.

```ts
// routers/leaderboard.ts
import { baseProcedure, createTRPCRouter } from "../init";

export const leaderboardRouter = createTRPCRouter({
  stats: baseProcedure.query(async ({ ctx }) => {
    // ctx.db disponível aqui
    return { totalRoasts: 0, avgScore: 0 };
  }),
});
```

### Tipos de procedures

| Tipo | Quando usar |
|------|-------------|
| `.query()` | Leitura de dados (GET semântico) |
| `.mutation()` | Escrita/ação com efeito colateral (POST semântico) |

### Input validation

Usar **Zod** para validar inputs de procedures:

```ts
import { z } from "zod";

export const roastRouter = createTRPCRouter({
  getById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.select().from(roasts).where(eq(roasts.id, input.id));
    }),
});
```

---

## Handler HTTP (`src/app/api/trpc/[trpc]/route.ts`)

```ts
export { GET, POST } from "@trpc/server/adapters/fetch";
```

Não modificar este arquivo — é o ponto de entrada HTTP do tRPC para requests client-side.

---

## Checklist para Novos Routers

- [ ] Arquivo criado em `src/trpc/routers/` com nome em `kebab-case.ts`
- [ ] Usa `createTRPCRouter` e `baseProcedure` de `../init`
- [ ] Input validado com Zod (para queries/mutations com parâmetros)
- [ ] Router exportado e adicionado ao `appRouter` em `_app.ts`
- [ ] Tipos exportados via `AppRouter` (automático via `typeof appRouter`)
- [ ] Server Components usam `trpc` de `@/trpc/server` (sem HTTP)
- [ ] Client Components usam `useTRPC()` de `@/trpc/client`
