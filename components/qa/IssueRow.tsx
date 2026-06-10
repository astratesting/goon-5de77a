"use client";

import { XCircle, AlertTriangle, Info, Wrench, Eye } from "lucide-react";

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

interface IssueRowProps {
  issue: QAIssue;
  onFix?: () => void;
  onShowInPreview?: () => void;
}

export default function IssueRow({ issue, onFix, onShowInPreview }: IssueRowProps) {
  const severityConfig = {
    fail: { icon: XCircle, color: "text-red", bg: "bg-red/10" },
    warn: { icon: AlertTriangle, color: "text-amber", bg: "bg-amber/10" },
    info: { icon: Info, color: "text-cyan", bg: "bg-cyan/10" },
  };

  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-t border-border/50 first:border-t-0">
      <div className={`mt-0.5 shrink-0 ${config.color}`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text">{issue.title}</p>
        <p className="text-xs text-text-dim mt-0.5">{issue.detail}</p>
        {issue.selector && (
          <p className="text-xs font-mono text-text-faint mt-1 truncate">{issue.selector}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onShowInPreview && (
          <button
            onClick={onShowInPreview}
            className="flex items-center gap-1 text-xs text-cyan hover:text-indigo transition-colors duration-120"
          >
            <Eye size={12} />
            Show
          </button>
        )}
        {onFix && issue.autoFix && (
          <button
            onClick={onFix}
            className="flex items-center gap-1 text-xs text-teal hover:text-indigo transition-colors duration-120"
          >
            <Wrench size={12} />
            Fix
          </button>
        )}
      </div>
    </div>
  );
}
