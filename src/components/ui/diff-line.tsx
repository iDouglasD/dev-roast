import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLineVariants = tv({
  base: "flex w-full items-center gap-2 px-4 py-2 font-mono text-code",
  variants: {
    variant: {
      removed: "bg-diff-removed",
      added: "bg-diff-added",
      context: "",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const prefixVariants = tv({
  base: "shrink-0 select-none font-mono text-code",
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
  base: "font-mono text-code",
  variants: {
    variant: {
      removed: "text-text-secondary",
      added: "text-text-primary",
      context: "text-text-secondary",
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
