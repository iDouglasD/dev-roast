import { tv } from "tailwind-variants";

const pulse = tv({
  base: "inline-block animate-pulse rounded bg-bg-elevated align-middle",
});

function LeaderboardSkeleton() {
  return (
    <div className="flex w-full max-w-leaderboard flex-col gap-10 px-10 py-10">
      {/* Hero skeleton */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-3xl font-bold text-accent-green">
            {">"}
          </span>
          <h1 className="font-mono text-3xl font-bold text-text-primary">
            shame_leaderboard
          </h1>
        </div>
        <p className="font-mono text-sm text-text-secondary">
          {"// the most roasted code on the internet"}
        </p>
        <div className="flex items-center gap-2">
          <span className={pulse({ class: "h-3 w-24" })} />
          <span className="text-text-tertiary">·</span>
          <span className={pulse({ class: "h-3 w-32" })} />
        </div>
      </section>

      {/* Card skeletons */}
      <section className="flex flex-col gap-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="overflow-hidden border border-border-primary">
            {/* Meta row skeleton */}
            <div className="flex items-center justify-between bg-bg-surface px-5 py-3">
              <div className="flex items-center gap-4">
                <span className={pulse({ class: "h-3 w-6" })} />
                <span className={pulse({ class: "h-3 w-10" })} />
                <span className={pulse({ class: "h-3 w-24" })} />
              </div>
              <div className="flex items-center gap-3">
                <span className={pulse({ class: "h-3 w-16" })} />
                <span className={pulse({ class: "h-3 w-12" })} />
              </div>
            </div>

            {/* Roast comment skeleton */}
            <div className="border-b border-border-primary bg-bg-surface px-5 py-3">
              <span className={pulse({ class: "h-3 w-3/4" })} />
            </div>

            {/* Code block skeleton */}
            <div className="flex flex-col gap-2 bg-bg-input px-5 py-4">
              <span className={pulse({ class: "h-3 w-3/4" })} />
              <span className={pulse({ class: "h-3 w-1/2" })} />
              <span className={pulse({ class: "h-3 w-2/3" })} />
            </div>

            {/* Expand trigger skeleton */}
            <div className="flex justify-center border-t border-border-primary bg-bg-surface py-2">
              <span className={pulse({ class: "h-3 w-20" })} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export { LeaderboardSkeleton };
