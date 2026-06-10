"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import ScoreRing from "@/components/qa/ScoreRing";
import SummaryTiles from "@/components/qa/SummaryTiles";
import { RefreshCw, ChevronRight, Smartphone, Monitor, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

interface PageQAData {
  id: string;
  title: string;
  status: string;
  score: number | null;
  band: string | null;
  subdomain: string | null;
  updatedAt: string;
  mobileIssues: number;
  totalIssues: number;
  failCount: number;
  hasHtml: boolean;
}

const FILTERS = ["All", "Mobile", "Accessibility", "SEO", "Performance"] as const;
type Filter = (typeof FILTERS)[number];

export default function QAReportPage() {
  const [pages, setPages] = useState<PageQAData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");
  const [sortAsc, setSortAsc] = useState(true);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/qa/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleRescanAll = async () => {
    setScanning(true);
    try {
      await fetch("/api/qa/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await fetchPages();
    } catch {
      // silent
    } finally {
      setScanning(false);
    }
  };

  // Filter
  let filtered = pages;
  if (filter === "Mobile") {
    filtered = pages.filter((p) => p.mobileIssues > 0);
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    const scoreA = a.score ?? 0;
    const scoreB = b.score ?? 0;
    return sortAsc ? scoreA - scoreB : scoreB - scoreA;
  });

  // Summary stats
  const avgScore = pages.length > 0 ? Math.round(pages.reduce((s, p) => s + (p.score ?? 0), 0) / pages.length) : 0;
  const scannedCount = pages.filter((p) => p.score !== null).length;
  const mobileReadyCount = pages.filter((p) => (p.score ?? 0) >= 80).length;
  const totalIssues = pages.reduce((s, p) => s + p.totalIssues, 0);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const bandColor = (band: string | null) => {
    if (band === "good") return "text-teal";
    if (band === "fair") return "text-cyan";
    if (band === "poor") return "text-amber";
    return "text-text-faint";
  };

  return (
    <div className="h-full flex flex-col">
      <TopBar showSearch={false} showNewPage={false} />

      <div className="flex-1 overflow-auto p-6 max-w-[1120px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text">QA Report</h1>
            <p className="text-sm text-text-dim mt-0.5">Quality scores for all your pages</p>
          </div>
          <Button
            onClick={handleRescanAll}
            loading={scanning}
            variant="ghost"
            size="sm"
          >
            <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
            Re-scan all
          </Button>
        </div>

        {/* Scanning progress */}
        {scanning && (
          <div className="w-full h-1 bg-ink-3 rounded-full overflow-hidden">
            <div className="h-full bg-indigo rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        )}

        {/* Summary tiles */}
        <SummaryTiles
          avgScore={avgScore}
          pagesScanned={scannedCount}
          mobileReadyCount={mobileReadyCount}
          totalIssues={totalIssues}
        />

        {/* Filters and sort */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-input text-xs font-medium transition-colors duration-120 ${
                  filter === f
                    ? "bg-indigo/20 text-indigo border border-indigo/30"
                    : "bg-ink-2 text-text-faint border border-border hover:text-text-dim"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="text-xs text-text-faint hover:text-text-dim transition-colors"
          >
            Score {sortAsc ? "↑" : "↓"}
          </button>
        </div>

        {/* Page list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-ink-2 rounded-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-dim text-sm">
              {filter !== "All"
                ? `No pages match the "${filter}" filter.`
                : "No pages to score yet. Create a page to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((page) => (
              <Link
                key={page.id}
                href={`/dashboard/qa/${page.id}`}
                className="flex items-center gap-4 p-4 bg-ink-2 border border-border rounded-card hover:border-indigo/30 transition-all duration-120 group"
              >
                {/* Score ring */}
                {page.score !== null ? (
                  <ScoreRing score={page.score} size="sm" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-ink-3 border border-border flex items-center justify-center">
                    <span className="text-xs text-text-faint">—</span>
                  </div>
                )}

                {/* Page info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{page.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {page.subdomain && (
                      <span className="text-xs font-mono text-text-faint">{page.subdomain}.goon.app</span>
                    )}
                    <span className="text-xs text-text-faint">{timeAgo(page.updatedAt)}</span>
                  </div>
                </div>

                {/* Mobile badge */}
                <div className="shrink-0">
                  {page.mobileIssues > 0 ? (
                    <span className="flex items-center gap-1 text-xs text-amber bg-amber/10 px-2 py-1 rounded">
                      <Smartphone size={12} /> {page.mobileIssues} issues
                    </span>
                  ) : page.hasHtml ? (
                    <span className="flex items-center gap-1 text-xs text-teal bg-teal/10 px-2 py-1 rounded">
                      <Smartphone size={12} /> Ready
                    </span>
                  ) : null}
                </div>

                {/* Issues count */}
                <div className="shrink-0 text-right">
                  {page.totalIssues > 0 ? (
                    <span className="flex items-center gap-1 text-xs text-amber">
                      <AlertTriangle size={12} /> {page.totalIssues}
                    </span>
                  ) : (
                    <span className="text-xs text-teal">Clean</span>
                  )}
                </div>

                {/* Score band */}
                <span className={`text-sm font-mono font-medium shrink-0 ${bandColor(page.band)}`}>
                  {page.score ?? "—"}
                </span>

                <ChevronRight size={14} className="text-text-faint group-hover:text-indigo transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
