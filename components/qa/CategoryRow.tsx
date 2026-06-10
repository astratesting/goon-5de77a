"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle, XCircle, Info } from "lucide-react";
import IssueRow from "./IssueRow";

interface QAIssue {
  id: string;
  severity: "fail" | "warn" | "info";
  selector: string | null;
  title: string;
  detail: string;
  autoFix?: {
    action: string;
    params?: Record<string, unknown>;
  };
}

interface CategoryRowProps {
  id: string;
  label: string;
  score: number;
  issues: QAIssue[];
  onFix?: (issueId: string) => void;
  onShowInPreview?: (selector: string) => void;
  defaultExpanded?: boolean;
}

export default function CategoryRow({
  label,
  score,
  issues,
  onFix,
  onShowInPreview,
  defaultExpanded = false,
}: CategoryRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const color =
    score >= 90 ? "var(--teal)" : score >= 70 ? "var(--cyan)" : score >= 50 ? "var(--amber)" : "var(--red)";

  const barBg = "var(--border)";
  const failCount = issues.filter((i) => i.severity === "fail").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  return (
    <div className="border border-border rounded-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center w-full px-4 py-3 hover:bg-ink-3 transition-colors duration-120 gap-3"
      >
        {/* Score bar */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-sm font-medium text-text w-28 text-left">{label}</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: barBg }}>
            <div
              className="h-full rounded-full transition-all duration-600 ease-out"
              style={{ width: `${score}%`, background: color }}
            />
          </div>
          <span
            className="text-sm font-mono font-semibold tabular-nums w-8 text-right"
            style={{ color }}
          >
            {score}
          </span>
        </div>

        {/* Issue counts */}
        <div className="flex items-center gap-2 shrink-0">
          {failCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-red">
              <XCircle size={12} /> {failCount}
            </span>
          )}
          {warnCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber">
              <AlertTriangle size={12} /> {warnCount}
            </span>
          )}
          {issues.length === 0 && (
            <span className="text-xs text-teal">Pass</span>
          )}
        </div>

        <ChevronDown
          size={14}
          className={`text-text-faint shrink-0 transition-transform duration-120 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && issues.length > 0 && (
        <div className="border-t border-border bg-ink/50">
          {issues.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              onFix={onFix ? () => onFix(issue.id) : undefined}
              onShowInPreview={
                onShowInPreview && issue.selector
                  ? () => onShowInPreview(issue.selector!)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
