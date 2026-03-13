import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-2 font-mono text-code font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      primary: "bg-emerald-500 text-zinc-950 hover:bg-emerald-400",
      secondary: "bg-zinc-800 text-zinc-50 hover:bg-zinc-700",
      outline:
        "border border-zinc-700 bg-transparent text-zinc-50 hover:bg-zinc-800",
      ghost: "bg-transparent text-zinc-50 hover:bg-zinc-800",
      destructive: "bg-red-600 text-zinc-50 hover:bg-red-500",
    },
    size: {
      sm: "px-4 py-1.5",
      md: "px-6 py-2.5",
      lg: "px-8 py-3",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonProps = ComponentProps<"button"> & ButtonVariants;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants, type ButtonProps };
