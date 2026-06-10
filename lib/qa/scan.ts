import { runMobileChecks } from "./rules/mobile";
import { runLayoutChecks } from "./rules/layout";
import { runTypographyChecks } from "./rules/typography";
import { runAccessibilityChecks } from "./rules/accessibility";
import { runSEOChecks } from "./rules/seo";
import { runPerformanceChecks } from "./rules/performance";
import { computeScore } from "./score";
import { generateSuggestions } from "./suggestions";
import type { QAResult, QACategory, CategoryId, QAIssue } from "./types";

const CATEGORY_META: Record<CategoryId, { label: string; runner: (html: string, prompt: string) => QAIssue[] }> = {
  mobile: { label: "Mobile", runner: (html) => runMobileChecks(html) },
  layout: { label: "Layout", runner: (html, prompt) => runLayoutChecks(html, prompt) },
  typography: { label: "Typography", runner: (html) => runTypographyChecks(html) },
  accessibility: { label: "Accessibility", runner: (html) => runAccessibilityChecks(html) },
  seo: { label: "SEO", runner: (html) => runSEOChecks(html) },
  performance: { label: "Performance", runner: (html) => runPerformanceChecks(html) },
};

export async function runFullQA(
  pageId: string,
  html: string,
  prompt: string
): Promise<QAResult> {
  const categories: QACategory[] = [];

  for (const [id, meta] of Object.entries(CATEGORY_META) as [CategoryId, typeof CATEGORY_META[CategoryId]][]) {
    const issues = meta.runner(html, prompt);
    const categoryScore = computeCategoryScore(issues);
    categories.push({ id, score: categoryScore, issues });
  }

  const overall = computeScore(categories);
  const band: QAResult["band"] = overall >= 90 ? "good" : overall >= 70 ? "fair" : "poor";
  const suggestions = generateSuggestions(categories);

  return {
    pageId,
    scannedAt: new Date().toISOString(),
    overall,
    band,
    categories,
    suggestions,
  };
}

function computeCategoryScore(issues: QAIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === "fail") score -= 15;
    else if (issue.severity === "warn") score -= 5;
    else if (issue.severity === "info") score -= 1;
  }
  return Math.max(0, Math.min(100, score));
}
