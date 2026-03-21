import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const analysisCardRootVariants = tv({
  base: "flex w-full flex-col gap-3 border border-border-primary p-5",
});

type AnalysisCardRootVariants = VariantProps<typeof analysisCardRootVariants>;

type AnalysisCardRootProps = ComponentProps<"div"> & AnalysisCardRootVariants;

const AnalysisCardRoot = forwardRef<HTMLDivElement, AnalysisCardRootProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={analysisCardRootVariants({ className })}
        {...props}
      >
        {children}
      </div>
    );
  },
);

AnalysisCardRoot.displayName = "AnalysisCardRoot";

// ---

const analysisCardTitleVariants = tv({
  base: "font-mono text-code font-medium text-text-primary",
});

type AnalysisCardTitleProps = ComponentProps<"p">;

const AnalysisCardTitle = forwardRef<
  HTMLParagraphElement,
  AnalysisCardTitleProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={analysisCardTitleVariants({ className })}
      {...props}
    />
  );
});

AnalysisCardTitle.displayName = "AnalysisCardTitle";

// ---

const analysisCardDescriptionVariants = tv({
  base: "font-mono text-xs leading-relaxed text-text-secondary",
});

type AnalysisCardDescriptionProps = ComponentProps<"p">;

const AnalysisCardDescription = forwardRef<
  HTMLParagraphElement,
  AnalysisCardDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={analysisCardDescriptionVariants({ className })}
      {...props}
    />
  );
});

AnalysisCardDescription.displayName = "AnalysisCardDescription";

// ---

const AnalysisCard = Object.assign(AnalysisCardRoot, {
  Title: AnalysisCardTitle,
  Description: AnalysisCardDescription,
});

export {
  AnalysisCard,
  AnalysisCardRoot,
  AnalysisCardTitle,
  AnalysisCardDescription,
  analysisCardRootVariants,
  analysisCardTitleVariants,
  analysisCardDescriptionVariants,
  type AnalysisCardRootProps,
  type AnalysisCardTitleProps,
  type AnalysisCardDescriptionProps,
};
