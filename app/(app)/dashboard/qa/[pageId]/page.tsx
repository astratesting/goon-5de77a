"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import ScoreRing from "@/components/qa/ScoreRing";
import CategoryRow from "@/components/qa/CategoryRow";
import DeviceFrame from "@/components/qa/DeviceFrame";
import Button from "@/components/ui/Button";
import { ArrowLeft, RefreshCw, Wrench } from "lucide-react";
import { showToast } from "@/components/ui/Toast";

interface QAIssue {
  id: string;
  severity: "fail" | "warn" | "info";
  selector: string | null;
  title: string;
  detail: string;
  autoFix?: { action: string; params?: Record<string, unknown> };
}

interface QACategory {
  id: string;
  score: number;
  issues: QAIssue[];
}

interface QAResult {
  overall: number;
  band: string;
  categories: QACategory[];
  suggestions: string[];
  scannedAt: string;
}

interface PageData {
  id: string;
  title: string;
  html: string;
  qaReportJson: QAResult | null;
  qaScore: number | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  mobile: "Mobile",
  layout: "Layout",
  typography: "Typography",
  accessibility: "Accessibility",
  seo: "SEO",
  performance: "Performance",
};

export default function QADetailPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [deviceWidth, setDeviceWidth] = useState("375");
  const [highlightSelector, setHighlightSelector] = useState<string | null>(null);
  const [fixingIssue, setFixingIssue] = useState<string | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);

  const fetchPage = useCallback(async () => {
    try {
      const res = await fetch(`/api/pages/${pageId}`);
      if (res.ok) {
        const data = await res.json();
        setPage(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleRescan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/qa/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      if (res.ok) {
        const result = await res.json();
        setPage((prev) => prev ? { ...prev, qaReportJson: result, qaScore: result.overall } : prev);
        showToast({ type: "success", message: "Scan complete" });
      }
    } catch {
      showToast({ type: "error", message: "Scan failed" });
    } finally {
      setScanning(false);
    }
  };

  const handleFix = async (issueId: string) => {
    setFixingIssue(issueId);
    const oldScore = page?.qaScore ?? null;
    setPreviousScore(oldScore);

    try {
      const res = await fetch("/api/qa/autofix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, issueId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPage((prev) => prev ? {
          ...prev,
          qaReportJson: data.result,
          qaScore: data.result.overall,
          html: prev.html, // keep existing HTML
        } : prev);
        showToast({ type: "success", message: `Fixed! Score: ${data.previousScore} → ${data.newScore}` });
      } else {
        const err = await res.json();
        showToast({ type: "error", message: err.error || "Fix failed" });
      }
    } catch {
      showToast({ type: "error", message: "Fix failed" });
    } finally {
      setFixingIssue(null);
    }
  };

  const handleShowInPreview = (selector: string) => {
    setHighlightSelector(selector);
  };

  const report = page?.qaReportJson;
  const html = page?.html || "";

  const bandLabel = report?.band === "good" ? "Good" : report?.band === "fair" ? "Fair" : "Needs work";
  const bandColor = report?.band === "good" ? "text-teal" : report?.band === "fair" ? "text-cyan" : "text-amber";

  return (
    <div className="h-full flex flex-col">
      <TopBar showSearch={false} showNewPage={false} />

      <div className="flex-1 overflow-auto p-6 max-w-[1120px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/qa" className="text-text-faint hover:text-text transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-text">{page?.title || "Page"}</h1>
              <p className="text-xs text-text-faint">QA Report</p>
            </div>
          </div>
          <Button onClick={handleRescan} loading={scanning} variant="ghost" size="sm">
            <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
            Re-scan
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-indigo/30 border-t-indigo rounded-full animate-spin" />
          </div>
        ) : !report ? (
          <div className="text-center py-16">
            <p className="text-text-dim">No QA data available. Run a scan to get started.</p>
            <Button onClick={handleRescan} loading={scanning} className="mt-4">
              Run QA Scan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Preview */}
            <div className="lg:col-span-3 space-y-4">
              <DeviceFrame
                html={html}
                deviceWidth={deviceWidth}
                onDeviceChange={setDeviceWidth}
                highlightSelector={highlightSelector}
              />
            </div>

            {/* Right: Score breakdown */}
            <div className="lg:col-span-2 space-y-6">
              {/* Big score ring */}
              <div className="bg-ink-2 border border-border rounded-card p-6 flex flex-col items-center">
                {previousScore !== null && previousScore !== report.overall && (
                  <div className="mb-2">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                      report.overall > previousScore ? "bg-teal/20 text-teal" : "bg-amber/20 text-amber"
                    }`}>
                      {report.overall > previousScore ? "+" : ""}{report.overall - previousScore}
                    </span>
                  </div>
                )}
                <ScoreRing score={report.overall} size="xl" label />
                <p className={`text-sm font-medium mt-2 ${bandColor}`}>{bandLabel}</p>
              </div>

              {/* Category list */}
              <div className="space-y-2">
                {report.categories.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    id={cat.id}
                    label={CATEGORY_LABELS[cat.id] || cat.id}
                    score={cat.score}
                    issues={cat.issues}
                    onFix={handleFix}
                    onShowInPreview={handleShowInPreview}
                    defaultExpanded={cat.score < 70}
                  />
                ))}
              </div>

              {/* Suggestions */}
              {report.suggestions.length > 0 && (
                <div className="bg-ink-2 border border-border rounded-card p-4 space-y-3">
                  <h3 className="text-sm font-medium text-text flex items-center gap-2">
                    <Wrench size={14} className="text-cyan" />
                    Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {report.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-text-dim leading-relaxed pl-4 relative">
                        <span className="absolute left-0 text-cyan">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
