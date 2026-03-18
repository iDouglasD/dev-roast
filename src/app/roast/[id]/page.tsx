import type { Metadata } from "next";
import type { BundledLanguage } from "shiki";
import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";

export const metadata: Metadata = {
  title: "Roast Results — Dev Roast",
  description: "See the full analysis and suggested fixes for your code.",
};

// ---------------------------------------------------------------------------
// Static data (placeholder until DB integration)
// ---------------------------------------------------------------------------

const STATIC_ROAST = {
  id: "00000000-0000-0000-0000-000000000000",
  score: 3.5,
  verdict: "needs_serious_help" as const,
  roastComment:
    '"this code looks like it was written during a power outage... in 2005."',
  language: "javascript" as BundledLanguage,
  lineCount: 16,
  code: `function calculateTotal(items) {
  var total = 0;

  for (var i = 0; i < items.length; i++) {
  }

  for (var j = 0; j < items.length; j++) {
    if (items[j].taxable) {
      total = total + items[j].price * 1.1;
    }
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
  issues: [
    {
      severity: "critical" as const,
      title: "using var instead of const/let",
      description:
        "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
    },
    {
      severity: "warning" as const,
      title: "imperative loop pattern",
      description:
        "for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
    },
    {
      severity: "good" as const,
      title: "clear naming conventions",
      description:
        "calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
    },
    {
      severity: "good" as const,
      title: "single responsibility",
      description:
        "the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
    },
  ],
  diffLines: [
    { type: "context" as const, content: "function calculateTotal(items) {" },
    { type: "removed" as const, content: "  var total = 0;" },
    {
      type: "removed" as const,
      content: "  for (var i = 0; i < items.length; i++) {",
    },
    {
      type: "removed" as const,
      content: "    total = total + items[i].price;",
    },
    { type: "removed" as const, content: "  }" },
    { type: "removed" as const, content: "  return total;" },
    {
      type: "added" as const,
      content: "  return items.reduce((sum, item) => sum + item.price, 0);",
    },
    { type: "context" as const, content: "}" },
  ],
};

const VERDICT_LABELS: Record<string, string> = {
  needs_serious_help: "needs_serious_help",
  try_harder: "try_harder",
  not_terrible: "not_terrible",
  almost_decent: "almost_decent",
  mass_respect: "mass_respect",
};

// ---------------------------------------------------------------------------

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RoastResultPage({ params }: Props) {
  // `id` will be used for DB lookup once integrated — validated here
  const { id } = await params;
  void id; // suppresses unused-var lint until real fetch is added

  const roast = STATIC_ROAST;

  return (
    <main className="flex flex-1 flex-col items-center">
      <div className="flex w-full max-w-results flex-col gap-10 px-20 py-10">
        {/* ── Score Hero ──────────────────────────────────────────── */}
        <section className="flex items-center gap-12">
          <ScoreRing score={roast.score} />

          <div className="flex flex-col gap-4">
            {/* Verdict badge */}
            <Badge variant="critical">
              verdict: {VERDICT_LABELS[roast.verdict]}
            </Badge>

            {/* Roast quote */}
            <p className="font-mono text-xl leading-relaxed text-text-primary">
              {roast.roastComment}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 font-mono text-xs text-text-tertiary">
              <span>lang: {roast.language}</span>
              <span>·</span>
              <span>{roast.lineCount} lines</span>
            </div>

            {/* Share button */}
            <div>
              <button
                type="button"
                className="border border-border-primary px-4 py-2 font-mono text-xs text-text-primary transition-colors hover:border-text-secondary hover:text-text-primary"
              >
                $ share_roast
              </button>
            </div>
          </div>
        </section>

        <hr className="border-border-primary" />

        {/* ── Submitted Code ──────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-accent-green">{"//"}</span>
            <span className="text-text-primary">your_submission</span>
          </h2>

          <CodeBlock>
            <CodeBlock.Body code={roast.code} lang={roast.language} />
          </CodeBlock>
        </section>

        <hr className="border-border-primary" />

        {/* ── Detailed Analysis ───────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-accent-green">{"//"}</span>
            <span className="text-text-primary">detailed_analysis</span>
          </h2>

          <div className="flex flex-col gap-5">
            {/* Row 1 */}
            <div className="flex gap-5">
              {roast.issues.slice(0, 2).map((issue) => (
                <AnalysisCard key={issue.title} className="flex-1">
                  <Badge variant={issue.severity}>{issue.severity}</Badge>
                  <AnalysisCard.Title>{issue.title}</AnalysisCard.Title>
                  <AnalysisCard.Description>
                    {issue.description}
                  </AnalysisCard.Description>
                </AnalysisCard>
              ))}
            </div>
            {/* Row 2 */}
            <div className="flex gap-5">
              {roast.issues.slice(2, 4).map((issue) => (
                <AnalysisCard key={issue.title} className="flex-1">
                  <Badge variant={issue.severity}>{issue.severity}</Badge>
                  <AnalysisCard.Title>{issue.title}</AnalysisCard.Title>
                  <AnalysisCard.Description>
                    {issue.description}
                  </AnalysisCard.Description>
                </AnalysisCard>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-border-primary" />

        {/* ── Suggested Fix ───────────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-accent-green">{"//"}</span>
            <span className="text-text-primary">suggested_fix</span>
          </h2>

          <div className="overflow-hidden border border-border-primary bg-bg-input">
            {/* Diff header */}
            <div className="flex h-10 items-center border-b border-border-primary px-4">
              <span className="font-mono text-xs font-medium text-text-secondary">
                your_code.ts → improved_code.ts
              </span>
            </div>

            {/* Diff lines */}
            <div className="py-1">
              {roast.diffLines.map((line, index) => (
                <DiffLine key={index} variant={line.type}>
                  {line.content}
                </DiffLine>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
