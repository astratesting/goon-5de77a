"use client";

import Link from "next/link";
import ScoreBadge from "./ScoreBadge";
import StatusPill from "./StatusPill";

interface PageCardProps {
  id: string;
  title: string;
  status: string;
  score: number | null;
  updatedAt: string;
  subdomain?: string | null;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d`;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PageCard({
  id,
  title,
  status,
  score,
  updatedAt,
}: PageCardProps) {
  const firstLetter = title.charAt(0).toUpperCase() || "G";

  return (
    <Link
      href={`/p/${id}`}
      className="group block bg-ink-2 border border-border rounded-card overflow-hidden hover:border-text-faint transition-all duration-120"
    >
      {/* Thumbnail placeholder */}
      <div className="h-32 bg-ink-3 flex items-center justify-center border-b border-border relative overflow-hidden">
        <span className="text-4xl font-semibold text-text-faint/30">
          {firstLetter}
        </span>
        <div className="absolute top-2 right-2">
          <StatusPill status={status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-text truncate group-hover:text-indigo transition-colors duration-120">
            {title}
          </h3>
          {score !== null && <ScoreBadge score={score} size="sm" />}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-text-faint tabular-nums">
            {timeAgo(updatedAt)}
          </span>
          {status === "published" && (
            <span className="text-xs text-teal">Published</span>
          )}
        </div>
      </div>
    </Link>
  );
}
