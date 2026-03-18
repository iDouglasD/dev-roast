import Link from "next/link";
import { HomepageStats } from "@/components/homepage-stats";
import { RoastForm } from "@/components/roast-form";
import { HydrateClient } from "@/trpc/server";

const leaderboardData = [
  {
    rank: 1,
    score: 1.2,
    code: `function auth(u,p) {\n  if (u == "admin" && p == "123")`,
    lang: "javascript",
  },
  {
    rank: 2,
    score: 2.1,
    code: `eval(input("Enter code: "))\nprint("seems safe")`,
    lang: "python",
  },
  {
    rank: 3,
    score: 2.8,
    code: `SELECT * FROM users\nWHERE id = '\${userId}'`,
    lang: "sql",
  },
];

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
        <section className="w-leaderboard max-w-full px-10">
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

          {/* Table */}
          <div className="mt-4 overflow-hidden border border-border-primary">
            <table className="w-full font-mono">
              <thead>
                <tr className="h-10 bg-bg-surface text-xs font-medium text-text-tertiary">
                  <th className="w-12.5 px-5 text-left">#</th>
                  <th className="w-17.5 px-5 text-left">score</th>
                  <th className="px-5 text-left">code</th>
                  <th className="w-25 px-5 text-left">lang</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((row) => (
                  <tr
                    key={row.rank}
                    className="border-t border-border-primary text-xs"
                  >
                    <td className="px-5 py-4">
                      <span
                        className={
                          row.rank === 1
                            ? "font-bold text-accent-amber"
                            : "text-text-secondary"
                        }
                      >
                        {row.rank}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-accent-red">
                      {row.score.toFixed(1)}
                    </td>
                    <td className="px-5 py-4">
                      <pre className="whitespace-pre text-text-primary">
                        {row.code}
                      </pre>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {row.lang}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fade hint */}
          <p className="pt-4 text-center font-mono text-xs text-text-tertiary">
            showing top 3 of 2,847 ·{" "}
            <Link
              href="/leaderboard"
              className="transition-colors hover:text-text-secondary"
            >
              view full leaderboard {">>"}
            </Link>
          </p>
        </section>

        {/* Bottom padding */}
        <div className="h-15" />
      </main>
    </HydrateClient>
  );
}
