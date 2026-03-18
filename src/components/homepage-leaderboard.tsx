import Link from "next/link";
import type { BundledLanguage } from "shiki";
import { tv } from "tailwind-variants";
import { LeaderboardCodePreview } from "@/components/leaderboard-code-preview";
import { CodeBlock } from "@/components/ui/code-block";
import { caller } from "@/trpc/server";

const sectionVariants = tv({
  base: "w-leaderboard max-w-full px-10",
});

const rankVariants = tv({
  base: "text-text-secondary",
  variants: {
    first: {
      true: "font-bold text-accent-amber",
    },
  },
});

const cardVariants = tv({
  base: "overflow-hidden border border-border-primary",
});

const metaVariants = tv({
  base: "flex items-center gap-4 bg-bg-surface px-5 py-3 font-mono text-xs",
});

type HomepageLeaderboardProps = {
  className?: string;
};

/**
 * Map DB language enum to a valid Shiki BundledLanguage.
 * The enum value "other" has no Shiki grammar — fallback to "text".
 */
function toShikiLang(language: string): BundledLanguage {
  if (language === "other") return "text" as BundledLanguage;
  return language as BundledLanguage;
}

async function HomepageLeaderboard({ className }: HomepageLeaderboardProps) {
  const [entries, stats] = await Promise.all([
    caller.leaderboard.top3(),
    caller.leaderboard.stats(),
  ]);

  return (
    <section className={sectionVariants({ className })}>
      {/* Title row */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-mono text-sm font-bold text-text-primary">
          <span className="text-accent-green">{"//"}</span>
          shame_leaderboard
        </h2>
        <Link
          href="/leaderboard"
          className="font-mono text-xs text-text-secondary border border-border-primary px-3 py-1.5 transition-colors hover:text-text-primary hover:border-text-secondary"
        >
          $ view_all {">>"}
        </Link>
      </div>

      {/* Subtitle */}
      <p className="mt-2 font-mono text-code text-text-tertiary">
        {"// the worst code on the internet, ranked by shame"}
      </p>

      {/* Entry cards */}
      <div className="mt-4 flex flex-col gap-4">
        {entries.map((row, i) => (
          <div key={row.id} className={cardVariants()}>
            {/* Meta row */}
            <div className={metaVariants()}>
              <span className={rankVariants({ first: i === 0 })}>#{i + 1}</span>
              <span className="font-bold text-accent-red">
                {row.score.toFixed(1)}
              </span>
              <span className="text-text-secondary">{row.language}</span>
              <span className="text-text-tertiary">
                {row.code.split("\n").length} lines
              </span>
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
        ))}
      </div>

      {/* Footer */}
      <p className="pt-4 text-center font-mono text-xs text-text-tertiary">
        showing top 3 of {stats.totalRoasts.toLocaleString()} ·{" "}
        <Link
          href="/leaderboard"
          className="transition-colors hover:text-text-secondary"
        >
          view full leaderboard {">>"}
        </Link>
      </p>
    </section>
  );
}

export {
  HomepageLeaderboard,
  sectionVariants,
  rankVariants,
  cardVariants,
  metaVariants,
  type HomepageLeaderboardProps,
};
