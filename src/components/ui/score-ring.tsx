"use client";

import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const scoreRingVariants = tv({
  base: "relative",
});

type ScoreRingVariants = VariantProps<typeof scoreRingVariants>;

type ScoreRingProps = Omit<ComponentProps<"div">, "children"> &
  ScoreRingVariants & {
    score: number;
    maxScore?: number;
    size?: number;
  };

function getScoreColor(score: number, maxScore: number): string {
  const ratio = score / maxScore;
  if (ratio <= 0.33) return "#EF4444";
  if (ratio <= 0.66) return "#F59E0B";
  return "#10B981";
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
}

const ScoreRing = forwardRef<HTMLDivElement, ScoreRingProps>(
  ({ className, score, maxScore = 100, size = 180, ...props }, ref) => {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const percentage = Math.min(score / maxScore, 1);
    const sweepAngle = percentage * 360;
    const arcPath = describeArc(
      center,
      center,
      radius,
      0,
      Math.max(sweepAngle, 0.1),
    );
    const scoreColor = getScoreColor(score, maxScore);

    const gradientId = `score-gradient-${score}`;

    return (
      <div
        ref={ref}
        className={scoreRingVariants({ className })}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
        >
          <title>
            Score: {score}/{maxScore}
          </title>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor={scoreColor} />
            </linearGradient>
          </defs>

          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#2A2A2A"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Score arc */}
          {percentage > 0 && (
            <path
              d={arcPath}
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
          )}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span
            className="font-mono text-5xl font-bold leading-none"
            style={{ color: scoreColor }}
          >
            {score}
          </span>
          <span className="font-mono text-base text-text-tertiary leading-none">
            /{maxScore}
          </span>
        </div>
      </div>
    );
  },
);

ScoreRing.displayName = "ScoreRing";

export { ScoreRing, scoreRingVariants, type ScoreRingProps };
