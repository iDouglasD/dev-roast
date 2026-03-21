import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLineVariants = tv({
  base: "flex h-7 w-full items-center px-4 font-mono text-xs",
  variants: {
    variant: {
      removed: "bg-diff-removed-bg",
      added: "bg-diff-added-bg",
      context: "",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const prefixVariants = tv({
  base: "w-5 shrink-0 select-none font-mono text-xs",
  variants: {
    variant: {
      removed: "text-accent-red",
      added: "text-accent-green",
      context: "text-text-tertiary",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const codeVariants = tv({
  base: "font-mono text-xs",
  variants: {
    variant: {
      removed: "text-diff-removed-text",
      added: "text-diff-added-text",
      context: "text-text-primary",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

type DiffLineVariants = VariantProps<typeof diffLineVariants>;

type DiffLineProps = ComponentProps<"div"> & DiffLineVariants;

const prefixMap = {
  removed: "-",
  added: "+",
  context: " ",
} as const;

const DiffLine = forwardRef<HTMLDivElement, DiffLineProps>(
  ({ className, variant = "context", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={diffLineVariants({ variant, className })}
        {...props}
      >
        <span className={prefixVariants({ variant })}>
          {prefixMap[variant]}
        </span>
        <span className={codeVariants({ variant })}>{children}</span>
      </div>
    );
  },
);

DiffLine.displayName = "DiffLine";

export { DiffLine, diffLineVariants, type DiffLineProps };
