import { Suspense } from "react";
import { HomepageLeaderboard } from "@/components/homepage-leaderboard";
import { HomepageLeaderboardSkeleton } from "@/components/homepage-leaderboard-skeleton";
import { HomepageStats } from "@/components/homepage-stats";
import { RoastForm } from "@/components/roast-form";
import { HydrateClient } from "@/trpc/server";

export default function Home() {
  return (
    <HydrateClient>
      <main className="flex flex-1 flex-col items-center gap-8 pt-20">
        {/* Hero */}
        <section className="flex flex-col items-center gap-3 px-10">
          <h1 className="flex items-center gap-3 font-mono text-4xl font-bold">
            <span className="text-accent-green">$</span>
            <span className="text-text-primary">
              paste your code. get roasted.
            </span>
          </h1>
          <p className="font-mono text-sm text-text-secondary">
            {"// drop your code below..."}
          </p>
        </section>

        {/* Roast Form (client: editor + toggle + button) */}
        <section className="flex max-w-full flex-col items-center px-10">
          <RoastForm className="w-editor max-w-full" />
        </section>

        {/* Live stats */}
        <HomepageStats />

        {/* Spacer */}
        <div className="h-15" />

        {/* Leaderboard Preview */}
        <Suspense fallback={<HomepageLeaderboardSkeleton />}>
          <HomepageLeaderboard />
        </Suspense>

        {/* Bottom padding */}
        <div className="h-15" />
      </main>
    </HydrateClient>
  );
}
