"use client";

import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  label?: boolean;
  className?: string;
  animate?: boolean;
}

export default function ScoreRing({
  score,
  size = "md",
  label = false,
  className = "",
  animate = true,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }
    const start = displayScore;
    const diff = score - start;
    const duration = 600;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [score, animate]);

  const sizes = {
    sm: { ring: 36, stroke: 3, font: "text-xs" },
    md: { ring: 56, stroke: 4, font: "text-base" },
    lg: { ring: 80, stroke: 5, font: "text-2xl" },
    xl: { ring: 160, stroke: 8, font: "text-4xl" },
  };

  const s = sizes[size];
  const radius = (s.ring - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;

  const color =
    score >= 90 ? "var(--teal)" : score >= 70 ? "var(--cyan)" : score >= 50 ? "var(--amber)" : "var(--red)";

  const bandLabel =
    score >= 90 ? "Good" : score >= 70 ? "Fair" : "Needs work";

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: s.ring, height: s.ring }}
      >
        <svg
          width={s.ring}
          height={s.ring}
          className="transform -rotate-90"
        >
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={s.stroke}
          />
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: animate ? "stroke-dashoffset 600ms ease-out" : "none",
            }}
          />
        </svg>
        <span
          className={`absolute font-mono font-semibold tabular-nums ${s.font}`}
          style={{ color }}
        >
          {displayScore}
        </span>
      </div>
      {label && (
        <span className="text-xs font-medium" style={{ color }}>
          {bandLabel}
        </span>
      )}
    </div>
  );
}
