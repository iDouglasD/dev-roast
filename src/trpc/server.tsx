import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";
import { appRouter } from "./routers/_app";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
  router: appRouter,
  ctx: createTRPCContext,
  queryClient: getQueryClient,
});

/**
 * Server-side caller for direct procedure invocation in Server Components.
 * Bypasses HTTP — calls the router directly with the tRPC context.
 */
export const caller = appRouter.createCaller(createTRPCContext);

export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: tRPC queryOptions are typed at call site
export function prefetch(queryOptions: any) {
  void getQueryClient().prefetchQuery(queryOptions);
}
