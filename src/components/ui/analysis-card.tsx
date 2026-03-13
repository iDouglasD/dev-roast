import { type ComponentProps, forwardRef, type ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Badge } from "./badge";

const analysisCardVariants = tv({
  base: "flex w-full flex-col gap-3 border border-border-primary p-5",
});

type Severity = "critical" | "warning" | "good";

type AnalysisCardVariants = VariantProps<typeof analysisCardVariants>;

type AnalysisCardProps = ComponentProps<"div"> &
  AnalysisCardVariants & {
    severity: Severity;
    severityLabel?: string;
    title: string;
    description?: string;
    children?: ReactNode;
  };

const defaultLabels: Record<Severity, string> = {
  critical: "critical",
  warning: "warning",
  good: "good",
};

const AnalysisCard = forwardRef<HTMLDivElement, AnalysisCardProps>(
  (
    {
      className,
      severity,
      severityLabel,
      title,
      description,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={analysisCardVariants({ className })} {...props}>
        <Badge variant={severity}>
          {severityLabel ?? defaultLabels[severity]}
        </Badge>
        <p className="font-mono text-code text-text-primary">{title}</p>
        {description && (
          <p className="font-mono text-xs leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
        {children}
      </div>
    );
  },
);

AnalysisCard.displayName = "AnalysisCard";

export { AnalysisCard, analysisCardVariants, type AnalysisCardProps };
