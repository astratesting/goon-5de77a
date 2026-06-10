export interface QAIssue {
  id: string;
  severity: "fail" | "warn" | "info";
  selector: string | null;
  title: string;
  detail: string;
  autoFix?: {
    action: "bump-padding" | "add-viewport" | "lazy-load" | "set-srcset";
    params?: Record<string, unknown>;
  };
}

export interface QACategory {
  id: string;
  score: number;
  issues: QAIssue[];
}

export interface QAResult {
  pageId: string;
  scannedAt: string;
  overall: number;
  band: "good" | "fair" | "poor";
  categories: QACategory[];
  suggestions: string[];
}

export type CategoryId = "mobile" | "layout" | "typography" | "accessibility" | "seo" | "performance";

export const CATEGORY_WEIGHTS: Record<CategoryId, number> = {
  mobile: 35,
  layout: 15,
  typography: 10,
  accessibility: 15,
  seo: 15,
  performance: 10,
};
