import { type ComponentProps, forwardRef } from "react";
import { tv } from "tailwind-variants";

// --- Root ---

const leaderboardEntryRootVariants = tv({
  base: "flex flex-col border border-border-primary",
});

type LeaderboardEntryRootProps = ComponentProps<"div">;

const LeaderboardEntryRoot = forwardRef<
  HTMLDivElement,
  LeaderboardEntryRootProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={leaderboardEntryRootVariants({ className })}
    {...props}
  />
));

LeaderboardEntryRoot.displayName = "LeaderboardEntryRoot";

// --- Meta Row ---

const leaderboardEntryMetaVariants = tv({
  base: "flex h-12 items-center justify-between border-b border-border-primary px-5",
});

type LeaderboardEntryMetaProps = ComponentProps<"div"> & {
  rank: number;
  score: number;
  language: string;
  lineCount: number;
};

const LeaderboardEntryMeta = forwardRef<
  HTMLDivElement,
  LeaderboardEntryMetaProps
>(({ className, rank, score, language, lineCount, ...props }, ref) => (
  <div
    ref={ref}
    className={leaderboardEntryMetaVariants({ className })}
    {...props}
  >
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1.5 font-mono text-code">
        <span className="text-text-tertiary">#</span>
        <span className="font-bold text-accent-amber">{rank}</span>
      </span>
      <span className="flex items-center gap-1.5 font-mono text-xs">
        <span className="text-text-tertiary">score:</span>
        <span className="font-bold text-accent-red">{score.toFixed(1)}</span>
      </span>
    </div>
    <div className="flex items-center gap-3 font-mono text-xs">
      <span className="text-text-secondary">{language}</span>
      <span className="text-text-tertiary">
        {lineCount} {lineCount === 1 ? "line" : "lines"}
      </span>
    </div>
  </div>
));

LeaderboardEntryMeta.displayName = "LeaderboardEntryMeta";

// --- Code Preview ---

const leaderboardEntryCodeVariants = tv({
  base: "flex h-30 overflow-hidden bg-bg-input",
});

type LeaderboardEntryCodeProps = ComponentProps<"div">;

const LeaderboardEntryCode = forwardRef<
  HTMLDivElement,
  LeaderboardEntryCodeProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={leaderboardEntryCodeVariants({ className })}
    {...props}
  />
));

LeaderboardEntryCode.displayName = "LeaderboardEntryCode";

// --- Compound export ---

const LeaderboardEntry = Object.assign(LeaderboardEntryRoot, {
  Meta: LeaderboardEntryMeta,
  Code: LeaderboardEntryCode,
});

export {
  LeaderboardEntry,
  LeaderboardEntryRoot,
  LeaderboardEntryMeta,
  LeaderboardEntryCode,
  leaderboardEntryRootVariants,
  leaderboardEntryMetaVariants,
  leaderboardEntryCodeVariants,
  type LeaderboardEntryRootProps,
  type LeaderboardEntryMetaProps,
  type LeaderboardEntryCodeProps,
};
