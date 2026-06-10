"use client";

import Link from "next/link";
import ScoreBadge from "@/components/ScoreBadge";
import StatusPill from "@/components/StatusPill";
import { Smartphone, Monitor } from "lucide-react";

interface PageCardData {
  id: string;
  title: string;
  status: string;
  html: string | null;
  qaScore: number | null;
  qaReport: Record<string, unknown> | null;
  subdomain: string | null;
  createdAt?: string;
  updatedAt: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function getMobileStatus(page: PageCardData): "ready" | "issues" | "unknown" {
  if (!page.qaReport) return "unknown";
  const categories = (page.qaReport.categories as Array<{ id: string; issues: unknown[] }>) || [];
  const mobile = categories.find((c) => c.id === "mobile");
  if (!mobile) return "unknown";
  return mobile.issues.length === 0 ? "ready" : "issues";
}

export default function PageCard({ page }: { page: PageCardData }) {
  const mobileStatus = getMobileStatus(page);

  return (
    <Link
      href={`/p/${page.id}`}
      className="group block bg-ink-2 border border-border rounded-card overflow-hidden hover:border-indigo/40 transition-all duration-150"
    >
      {/* Thumbnail area */}
      <div className="aspect-[16/10] bg-ink-3 relative overflow-hidden">
        {page.html ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-[90%] h-[90%] bg-white rounded opacity-80 group-hover:opacity-90 transition-opacity" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Monitor size={24} className="text-text-faint" />
          </div>
        )}

        {/* Score ring top-right */}
        {page.qaScore !== null && (
          <div className="absolute top-2 right-2">
            <ScoreBadge score={page.qaScore} size="sm" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-sm font-medium text-text truncate">{page.title}</p>
        {page.subdomain && (
          <p className="text-xs font-mono text-text-faint truncate">{page.subdomain}.goon.app</p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <StatusPill status={page.status} />
          <span className="text-xs text-text-faint">{timeAgo(page.updatedAt)}</span>
          {mobileStatus === "ready" && (
            <span className="ml-auto flex items-center gap-1 text-xs text-teal">
              <Smartphone size={10} /> Mobile OK
            </span>
          )}
          {mobileStatus === "issues" && (
            <span className="ml-auto flex items-center gap-1 text-xs text-amber">
              <Smartphone size={10} /> Issues
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
