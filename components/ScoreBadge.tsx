"use client";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const sizes = {
    sm: { ring: 32, stroke: 3, font: "text-xs", ringPad: 2 },
    md: { ring: 48, stroke: 4, font: "text-base", ringPad: 3 },
    lg: { ring: 72, stroke: 5, font: "text-2xl", ringPad: 4 },
  };

  const s = sizes[size];
  const radius = (s.ring - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;

  const color =
    score >= 80 ? "var(--teal)" : score >= 60 ? "var(--amber)" : "var(--red)";

  return (
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
          className="score-ring-animate"
          style={{
            "--ring-circumference": circumference,
            "--ring-offset": offset,
          } as React.CSSProperties}
        />
      </svg>
      <span
        className={`absolute font-mono font-medium tabular-nums ${s.font}`}
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}
