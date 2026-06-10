import { runMobileChecks } from "./rules/mobile";
import { runLayoutChecks } from "./rules/layout";
import type { QAIssue } from "./types";

export interface QACheck {
  name: string;
  status: "pass" | "warn" | "fail";
  value: string;
  detail: string;
  viewport?: string;
}

export interface QAReport {
  score: number;
  checks: QACheck[];
  ranAt: string;
  breakdown: {
    layoutScore: number;
    mobileScore: number;
  };
}

function issuesToChecks(issues: QAIssue[]): QACheck[] {
  return issues.map((issue) => ({
    name: issue.title,
    status: issue.severity === "fail" ? "fail" as const : issue.severity === "warn" ? "warn" as const : "pass" as const,
    value: issue.severity === "fail" ? "Fail" : issue.severity === "warn" ? "Warning" : "Pass",
    detail: issue.detail,
    viewport: "375px",
  }));
}

function checksToScore(checks: QACheck[]): number {
  let score = 100;
  for (const check of checks) {
    if (check.status === "fail") score -= 15;
    else if (check.status === "warn") score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

export async function runQA(html: string, prompt: string): Promise<QAReport> {
  const mobileIssues = runMobileChecks(html);
  const layoutIssues = runLayoutChecks(html, prompt);

  const mobileChecks = issuesToChecks(mobileIssues);
  const layoutChecks = issuesToChecks(layoutIssues);

  const layoutScore = checksToScore(layoutChecks);
  const mobileScore = checksToScore(mobileChecks);

  const combined = Math.round(0.4 * layoutScore + 0.6 * mobileScore);

  return {
    score: combined,
    checks: [...layoutChecks, ...mobileChecks],
    ranAt: new Date().toISOString(),
    breakdown: { layoutScore, mobileScore },
  };
}
