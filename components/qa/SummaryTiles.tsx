"use client";

interface SummaryTilesProps {
  avgScore: number;
  pagesScanned: number;
  mobileReadyCount: number;
  totalIssues: number;
}

export default function SummaryTiles({
  avgScore,
  pagesScanned,
  mobileReadyCount,
  totalIssues,
}: SummaryTilesProps) {
  const tiles = [
    { label: "Avg Score", value: avgScore, suffix: "", color: avgScore >= 70 ? "var(--teal)" : "var(--amber)" },
    { label: "Pages Scanned", value: pagesScanned, suffix: "", color: "var(--cyan)" },
    { label: "Mobile Ready", value: mobileReadyCount, suffix: ` / ${pagesScanned}`, color: "var(--teal)" },
    { label: "Open Issues", value: totalIssues, suffix: "", color: totalIssues > 0 ? "var(--amber)" : "var(--teal)" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="bg-ink-2 border border-border rounded-card p-4"
        >
          <p className="text-xs text-text-faint mb-1">{tile.label}</p>
          <p className="text-2xl font-mono font-semibold tabular-nums" style={{ color: tile.color }}>
            {tile.value}
            {tile.suffix && <span className="text-sm text-text-dim">{tile.suffix}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}
