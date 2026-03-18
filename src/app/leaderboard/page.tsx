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
