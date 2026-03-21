import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { BundledLanguage } from "shiki";
import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { caller } from "@/trpc/server";

// ---------------------------------------------------------------------------

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const roast = await caller.roast.getById({ id });
  if (!roast) return { title: "Roast Not Found — Dev Roast" };

  const verdictLabel = roast.verdict.replace(/_/g, " ");
  const scoreDisplay = Math.round(roast.score * 10) / 10;
  const ogUrl = `/api/og/${id}`;

  return {
    title: `${verdictLabel} (${scoreDisplay}/100) — Dev Roast`,
    description:
      roast.roastComment.length > 155
        ? `${roast.roastComment.slice(0, 155).replace(/\s+\S*$/, "")}...`
        : roast.roastComment,
    openGraph: {
      title: `${verdictLabel} (${scoreDisplay}/100) — Dev Roast`,
      description: roast.roastComment,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${verdictLabel} (${scoreDisplay}/100) — Dev Roast`,
      images: [ogUrl],
    },
  };
}

export default async function RoastResultPage({ params }: Props) {
  "use cache";
  cacheLife("hours");

  const { id } = await params;
  const roast = await caller.roast.getById({ id });
  if (!roast) notFound();

  return (
    <main className="flex flex-1 flex-col items-center">
      <div className="flex w-full max-w-results flex-col gap-10 px-20 py-10">
        {/* ── Score Hero ──────────────────────────────────────────── */}
        <section className="flex items-center gap-12">
          <ScoreRing score={roast.score} />

          <div className="flex flex-col gap-4">
            {/* Verdict badge */}
            <Badge variant="critical">verdict: {roast.verdict}</Badge>

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
            <Suspense>
              <CodeBlock.Body
                code={roast.code}
                lang={roast.language as BundledLanguage}
              />
            </Suspense>
          </CodeBlock>
        </section>

        <hr className="border-border-primary" />

        {/* ── Detailed Analysis ───────────────────────────────────── */}
        <section className="flex flex-col gap-6">
          <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
            <span className="text-accent-green">{"//"}</span>
            <span className="text-text-primary">detailed_analysis</span>
          </h2>

          <div className="grid grid-cols-2 gap-5">
            {roast.issues.map((issue) => (
              <AnalysisCard key={issue.id}>
                <Badge variant={issue.severity}>{issue.severity}</Badge>
                <AnalysisCard.Title>{issue.title}</AnalysisCard.Title>
                <AnalysisCard.Description>
                  {issue.description}
                </AnalysisCard.Description>
              </AnalysisCard>
            ))}
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
                your_code.{roast.language} → improved_code.{roast.language}
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
