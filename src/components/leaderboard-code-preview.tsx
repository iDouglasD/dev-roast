"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { useState } from "react";
import { tv } from "tailwind-variants";

const previewVariants = tv({
  base: "relative",
});

const contentVariants = tv({
  base: "overflow-hidden transition-[max-height] duration-300 ease-out",
  variants: {
    expanded: {
      true: "max-h-[1000px]",
      false: "max-h-20",
    },
  },
  defaultVariants: {
    expanded: false,
  },
});

const gradientVariants = tv({
  base: "pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-bg-input to-transparent transition-opacity duration-300",
  variants: {
    visible: {
      true: "opacity-100",
      false: "opacity-0",
    },
  },
});

const triggerVariants = tv({
  base: "flex w-full items-center justify-center border-t border-border-primary bg-bg-surface py-2 font-mono text-code text-text-tertiary transition-colors hover:text-text-secondary",
});

type LeaderboardCodePreviewProps = {
  children: React.ReactNode;
  className?: string;
};

function LeaderboardCodePreview({
  children,
  className,
}: LeaderboardCodePreviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Collapsible.Root open={expanded} onOpenChange={setExpanded}>
      <div className={previewVariants({ className })}>
        {/* Content is always rendered — max-height clips it visually */}
        <div className={contentVariants({ expanded })}>{children}</div>

        {/* Gradient fade when collapsed */}
        <div className={gradientVariants({ visible: !expanded })} />
      </div>

      <Collapsible.Trigger className={triggerVariants()}>
        {expanded ? "$ collapse <<" : "$ expand >>"}
      </Collapsible.Trigger>
    </Collapsible.Root>
  );
}

export {
  LeaderboardCodePreview,
  previewVariants,
  contentVariants,
  gradientVariants,
  triggerVariants,
  type LeaderboardCodePreviewProps,
};
