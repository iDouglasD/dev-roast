import { tv } from "tailwind-variants";

const pulse = tv({
  base: "inline-block animate-pulse rounded bg-bg-elevated align-middle",
});

function HomepageLeaderboardSkeleton() {
  return (
    <section className="w-leaderboard max-w-full px-10">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-mono text-sm font-bold text-text-primary">
          <span className="text-accent-green">{"//"}</span>
          shame_leaderboard
        </h2>
        <span className={pulse({ class: "h-6 w-24" })} />
      </div>

      {/* Subtitle */}
      <p className="mt-2 font-mono text-code text-text-tertiary">
        {"// the worst code on the internet, ranked by shame"}
      </p>

      {/* Card skeletons */}
      <div className="mt-4 flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="overflow-hidden border border-border-primary">
            {/* Meta row skeleton */}
            <div className="flex items-center gap-4 bg-bg-surface px-5 py-3">
              <span className={pulse({ class: "h-3 w-6" })} />
              <span className={pulse({ class: "h-3 w-8" })} />
              <span className={pulse({ class: "h-3 w-16" })} />
              <span className={pulse({ class: "h-3 w-12" })} />
            </div>

            {/* Code block skeleton */}
            <div className="flex flex-col gap-2 bg-bg-input px-5 py-4">
              <span className={pulse({ class: "h-3 w-3/4" })} />
              <span className={pulse({ class: "h-3 w-1/2" })} />
              <span className={pulse({ class: "h-3 w-2/3" })} />
              <span className={pulse({ class: "h-3 w-1/3" })} />
            </div>

            {/* Expand trigger skeleton */}
            <div className="flex justify-center border-t border-border-primary bg-bg-surface py-2">
              <span className={pulse({ class: "h-3 w-20" })} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <p className="pt-4 text-center font-mono text-xs text-text-tertiary">
        <span className={pulse({ class: "h-3 w-40" })} />
      </p>
    </section>
  );
}

export { HomepageLeaderboardSkeleton };
