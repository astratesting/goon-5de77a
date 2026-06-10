"use client";

import { useState, useCallback, useEffect } from "react";
import ScoreRing from "@/components/qa/ScoreRing";
import IssueRow from "@/components/qa/IssueRow";
import Button from "@/components/ui/Button";
import { RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
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

interface QATabProps {
  pageId: string;
  score: number | null;
  report: {
    overall: number;
    band: string;
    categories: QACategory[];
    suggestions: string[];
  } | null;
}

export default function QATab({ pageId, score, report: initialReport }: QATabProps) {
  const [report, setReport] = useState(initialReport);
  const [scanning, setScanning] = useState(false);
  const [fixing, setFixing] = useState<string | null>(null);
  const [prevScore, setPrevScore] = useState<number | null>(null);

  const topIssues = report?.categories
    .flatMap((c) => c.issues.map((i) => ({ ...i, category: c.id })))
    .filter((i) => i.severity === "fail" || i.severity === "warn")
    .slice(0, 3) ?? [];

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
        setReport(result);
        showToast({ type: "success", message: "Scan complete" });
      }
    } catch {
      showToast({ type: "error", message: "Scan failed" });
    } finally {
      setScanning(false);
    }
  };

  const handleFix = async (issueId: string) => {
    setFixing(issueId);
    setPrevScore(score);
    try {
      const res = await fetch("/api/qa/autofix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, issueId }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data.result);
        showToast({ type: "success", message: `Fixed! Score: ${data.previousScore} → ${data.newScore}` });
      } else {
        showToast({ type: "error", message: "Fix failed" });
      }
    } catch {
      showToast({ type: "error", message: "Fix failed" });
    } finally {
      setFixing(null);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Score + rescan */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScoreRing score={score ?? 0} size="md" label />
          {prevScore !== null && score !== null && prevScore !== score && (
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${
              score > prevScore ? "bg-teal/20 text-teal" : "bg-amber/20 text-amber"
            }`}>
              {score > prevScore ? "+" : ""}{score - prevScore}
            </span>
          )}
        </div>
        <Button onClick={handleRescan} loading={scanning} variant="ghost" size="sm">
          <RefreshCw size={12} className={scanning ? "animate-spin" : ""} />
          Re-scan
        </Button>
      </div>

      {/* Top issues */}
      {topIssues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-text-faint uppercase tracking-wider">Top Issues</h4>
          <div className="border border-border rounded-card overflow-hidden divide-y divide-border/50">
            {topIssues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                onFix={() => handleFix(issue.id)}
              />
            ))}
          </div>
        </div>
      )}

      {topIssues.length === 0 && report && (
        <p className="text-sm text-teal">No major issues found.</p>
      )}

      {/* Link to full report */}
      <Link
        href={`/dashboard/qa/${pageId}`}
        className="flex items-center gap-1.5 text-sm text-cyan hover:text-indigo transition-colors"
      >
        <ExternalLink size={14} />
        Open full report
      </Link>
    </div>
  );
}
