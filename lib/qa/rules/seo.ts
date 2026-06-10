import type { QAIssue } from "../types";

export function runSEOChecks(html: string): QAIssue[] {
  const issues: QAIssue[] = [];

  // 1. Title tag
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!titleMatch) {
    issues.push({
      id: "seo.no-title",
      severity: "fail",
      selector: "title",
      title: "Missing page title",
      detail: "Every page needs a <title> tag for search engines and browser tabs.",
    });
  } else {
    const titleLen = titleMatch[1].trim().length;
    if (titleLen < 30) {
      issues.push({
        id: "seo.title-short",
        severity: "warn",
        selector: "title",
        title: "Title too short",
        detail: `Title is ${titleLen} characters — aim for 30–60 characters for best search visibility.`,
      });
    } else if (titleLen > 60) {
      issues.push({
        id: "seo.title-long",
        severity: "warn",
        selector: "title",
        title: "Title too long",
        detail: `Title is ${titleLen} characters — search engines may truncate it past 60 characters.`,
      });
    }
  }

  // 2. Meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  if (!descMatch) {
    issues.push({
      id: "seo.no-description",
      severity: "fail",
      selector: "meta[name=description]",
      title: "Missing meta description",
      detail: "A meta description helps search engines understand your page and shows in search results.",
    });
  } else {
    const descLen = descMatch[1].trim().length;
    if (descLen < 70) {
      issues.push({
        id: "seo.description-short",
        severity: "warn",
        selector: "meta[name=description]",
        title: "Meta description too short",
        detail: `Description is ${descLen} characters — aim for 70–160 characters.`,
      });
    } else if (descLen > 160) {
      issues.push({
        id: "seo.description-long",
        severity: "warn",
        selector: "meta[name=description]",
        title: "Meta description too long",
        detail: `Description is ${descLen} characters — search engines may truncate past 160.`,
      });
    }
  }

  // 3. Canonical link
  const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
  if (!hasCanonical) {
    issues.push({
      id: "seo.no-canonical",
      severity: "info",
      selector: null,
      title: "No canonical link",
      detail: "A canonical link tag helps prevent duplicate content issues in search results.",
    });
  }

  // 4. OpenGraph tags
  const hasOgTitle = /<meta[^>]*property=["']og:title["']/i.test(html);
  const hasOgDesc = /<meta[^>]*property=["']og:description["']/i.test(html);
  const hasOgImage = /<meta[^>]*property=["']og:image["']/i.test(html);
  const ogMissing: string[] = [];
  if (!hasOgTitle) ogMissing.push("og:title");
  if (!hasOgDesc) ogMissing.push("og:description");
  if (!hasOgImage) ogMissing.push("og:image");
  if (ogMissing.length > 0) {
    issues.push({
      id: "seo.open-graph",
      severity: "warn",
      selector: "head",
      title: "Missing OpenGraph tags",
      detail: `Missing ${ogMissing.join(", ")} — your page won't look right when shared on social media.`,
    });
  }

  // 5. Single H1 (shared with typography, but SEO-specific)
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1Count === 0) {
    issues.push({
      id: "seo.no-h1",
      severity: "fail",
      selector: null,
      title: "No H1 for SEO",
      detail: "Search engines use the H1 to understand the main topic — every page needs one.",
    });
  }

  return issues;
}
