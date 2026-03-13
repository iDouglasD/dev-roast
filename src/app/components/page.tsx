import { AnalysisCard } from "@/components/ui/analysis-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { ToggleShowcase } from "./toggle-showcase";

const buttonVariants = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "destructive",
] as const;
const buttonSizes = ["sm", "md", "lg"] as const;

const sampleCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}`;

export default function ComponentsPage() {
  return (
    <main className="min-h-screen bg-bg-page p-12">
      <h1 className="mb-2 font-mono text-2xl font-bold text-text-primary">
        <span className="text-accent-green">{"//"}</span> component_library
      </h1>
      <p className="mb-12 font-mono text-sm text-text-secondary">
        All reusable UI components for Dev Roast
      </p>

      {/* Button */}
      <Section title="buttons">
        <div className="space-y-10">
          {buttonVariants.map((variant) => (
            <div key={variant}>
              <h3 className="mb-3 font-mono text-sm uppercase tracking-wider text-text-tertiary">
                {variant}
              </h3>
              <div className="flex items-center gap-4">
                {buttonSizes.map((size) => (
                  <Button
                    key={`${variant}-${size}`}
                    variant={variant}
                    size={size}
                  >
                    {size}
                  </Button>
                ))}
                <Button variant={variant} disabled>
                  disabled
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Badge */}
      <Section title="badges">
        <div className="flex items-center gap-6">
          <Badge variant="critical">critical</Badge>
          <Badge variant="warning">warning</Badge>
          <Badge variant="good">good</Badge>
          <Badge variant="critical">needs_serious_help</Badge>
        </div>
      </Section>

      {/* Toggle */}
      <Section title="toggle">
        <ToggleShowcase />
      </Section>

      {/* Analysis Card */}
      <Section title="analysis_card">
        <div className="max-w-card space-y-4">
          <AnalysisCard
            severity="critical"
            title="using var instead of const/let"
            description="the var keyword is function-scoped rather than block-scoped, which can lead to unexpected behavior and bugs. modern javascript uses const for immutable bindings and let for mutable ones."
          />
          <AnalysisCard
            severity="warning"
            title="manual loop instead of array methods"
            description="using a for loop with an index variable is more error-prone than using array methods like reduce, map, or forEach."
          />
          <AnalysisCard
            severity="good"
            title="function is properly named"
            description="the function name clearly describes what it does, making the code self-documenting."
          />
        </div>
      </Section>

      {/* CodeBlock */}
      <Section title="code_block">
        <div className="max-w-code">
          <CodeBlock
            code={sampleCode}
            lang="javascript"
            filename="calculate.js"
          />
        </div>
      </Section>

      {/* DiffLine */}
      <Section title="diff_lines">
        <div className="max-w-code">
          <DiffLine variant="removed">var total = 0;</DiffLine>
          <DiffLine variant="added">const total = 0;</DiffLine>
          <DiffLine variant="context">
            {"for (let i = 0; i < items.length; i++) {"}
          </DiffLine>
        </div>
      </Section>

      {/* ScoreRing */}
      <Section title="score_ring">
        <div className="flex items-end gap-12">
          <ScoreRing score={2.1} />
          <ScoreRing score={3.5} />
          <ScoreRing score={5.5} />
          <ScoreRing score={8.2} />
        </div>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="mb-6 flex items-center gap-2">
        <span className="font-mono text-sm text-accent-green">{"//"}</span>
        <h2 className="font-mono text-sm text-text-secondary">{title}</h2>
      </div>
      {children}
    </section>
  );
}
