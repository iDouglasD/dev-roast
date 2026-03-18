import { tv } from "tailwind-variants";

const pulse = tv({
  base: "inline-block animate-pulse rounded bg-bg-elevated align-middle",
});

export function HomepageStatsSkeleton() {
  return (
    <p className="px-10 font-mono text-xs text-text-tertiary">
      <span className={pulse({ class: "h-3 w-10" })} />
      {" codes roasted · avg score: "}
      <span className={pulse({ class: "h-3 w-6" })} />
      {"/10"}
    </p>
  );
}
