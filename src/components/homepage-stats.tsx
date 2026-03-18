"use client";

import NumberFlow, { continuous } from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";
import { useTRPC } from "@/trpc/client";

export function HomepageStats({ className }: { className?: string }) {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.leaderboard.stats.queryOptions());

  return (
    <p className={twMerge("px-10 font-mono text-xs text-text-tertiary", className)}>
      <NumberFlow plugins={[continuous]} value={data?.totalRoasts ?? 0} /> codes roasted · avg score:{" "}
      <NumberFlow
        plugins={[continuous]}
        value={data?.avgScore ?? 0}
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
      />
      /10
    </p>
  );
}
