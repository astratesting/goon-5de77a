"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import ScoreBadge from "./ScoreBadge";

interface QACheck {
  name: string;
  status: "pass" | "warn" | "fail";
  value: string;
  detail: string;
  viewport?: string;
}

interface QAReportPanelProps {
  score: number;
  checks: QACheck[];
  collapsed?: boolean;
}

export default function QAReportPanel({
  score,
  checks,
  collapsed: initialCollapsed = false,
}: QAReportPanelProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const statusIcons = {
    pass: <CheckCircle size={14} className="text-teal" />,
    warn: <AlertTriangle size={14} className="text-amber" />,
    fail: <XCircle size={14} className="text-red" />,
  };

  const statusColors = {
    pass: "text-teal",
    warn: "text-amber",
    fail: "text-red",
  };

  const passCount = checks.filter((c) => c.status === "pass").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  return (
    <div className="border border-border rounded-card bg-ink-2 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-ink-3 transition-colors duration-120"
      >
        <div className="flex items-center gap-3">
          <ScoreBadge score={score} size="sm" />
          <div className="text-left">
            <p className="text-sm font-medium text-text">QA Score</p>
            <p className="text-xs text-text-faint">
              {passCount} passed
              {warnCount > 0 && `, ${warnCount} warnings`}
              {failCount > 0 && `, ${failCount} failed`}
            </p>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-text-faint transition-transform duration-120 ${
            collapsed ? "" : "rotate-180"
          }`}
        />
      </button>

      {!collapsed && (
        <div className="border-t border-border">
          {checks.map((check, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 px-4 py-2.5 border-b border-border last:border-0 hover:bg-ink-3/50 transition-colors duration-120"
            >
              <span className="mt-0.5 shrink-0">
                {statusIcons[check.status]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-text truncate">
                    {check.name}
                  </span>
                  <span
                    className={`text-xs font-mono tabular-nums shrink-0 ${
                      statusColors[check.status]
                    }`}
                  >
                    {check.value}
                  </span>
                </div>
                <p className="text-xs text-text-faint mt-0.5">{check.detail}</p>
                {check.viewport && (
                  <span className="inline-block mt-1 text-xs font-mono text-text-faint bg-ink-3 px-1.5 py-0.5 rounded">
                    {check.viewport}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
