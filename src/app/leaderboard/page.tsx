import type { Metadata } from "next";
import type { BundledLanguage } from "shiki";
import { CodeBlock } from "@/components/ui/code-block";
import { LeaderboardEntry } from "@/components/ui/leaderboard-entry";

export const metadata: Metadata = {
  title: "Shame Leaderboard — Dev Roast",
  description:
    "The most roasted code on the internet, ranked by shame. See the worst scores and learn what not to do.",
};

type LeaderboardItem = {
  rank: number;
  score: number;
  language: string;
  langId: BundledLanguage;
  code: string;
};

const leaderboardData: LeaderboardItem[] = [
  {
    rank: 1,
    score: 1.2,
    language: "javascript",
    langId: "javascript",
    code: `eval(prompt("enter code"))\ndocument.write(response)\n// trust the user lol`,
  },
  {
    rank: 2,
    score: 1.8,
    language: "typescript",
    langId: "typescript",
    code: `if (x == true) { return true; }\nelse if (x == false) { return false; }\nelse { return !false; }`,
  },
  {
    rank: 3,
    score: 2.1,
    language: "sql",
    langId: "sql",
    code: `SELECT * FROM users WHERE 1=1\n-- TODO: add authentication`,
  },
  {
    rank: 4,
    score: 2.3,
    language: "java",
    langId: "java",
    code: `catch (e) {\n  // ignore\n}`,
  },
  {
    rank: 5,
    score: 2.5,
    language: "javascript",
    langId: "javascript",
    code: `const sleep = (ms) =>\n  new Date(Date.now() + ms)\n  while(new Date() < end) {}`,
  },
];

export default function LeaderboardPage() {
  return (
    <main className="flex flex-1 flex-col items-center">
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
            <span>2,847 submissions</span>
            <span>·</span>
            <span>avg score: 4.2/10</span>
          </div>
        </section>

        {/* Leaderboard Entries */}
        <section className="flex flex-col gap-5">
          {leaderboardData.map((entry) => (
            <LeaderboardEntry key={entry.rank}>
              <LeaderboardEntry.Meta
                rank={entry.rank}
                score={entry.score}
                language={entry.language}
                lineCount={entry.code.split("\n").length}
              />
              <LeaderboardEntry.Code>
                <CodeBlock.Body
                  code={entry.code}
                  lang={entry.langId}
                  showLineNumbers
                />
              </LeaderboardEntry.Code>
            </LeaderboardEntry>
          ))}
        </section>
      </div>
    </main>
  );
}
