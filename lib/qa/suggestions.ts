import type { QACategory } from "./types";

const SUGGESTION_MAP: Record<string, string> = {
  "mobile.viewport-meta": "Add a viewport meta tag with width=device-width so your page scales properly on phones.",
  "mobile.viewport-zoom": "Let users zoom — remove user-scalable=no or maximum-scale=1 from your viewport meta.",
  "mobile.responsive-css": "Add CSS media queries or use flex/grid so your layout adapts to different screen sizes.",
  "mobile.responsive-css-fixed": "Replace fixed pixel widths with relative units (%, vw) or max-width for elements wider than 360px.",
  "mobile.touch-target": "Make buttons and links at least 44×44px so they're easy to tap on a phone.",
  "mobile.image-scaling": "Add max-width:100% to images so they shrink instead of overflowing on small screens.",
  "mobile.image-lazy": "Add loading=\"lazy\" to images below the fold to speed up initial page load.",
  "mobile.horizontal-overflow": "Remove wide fixed-width elements or negative margins that cause sideways scrolling on mobile.",
  "mobile.font-sizes": "Increase tiny text to at least 14px — small text is unreadable on phone screens.",
  "layout.empty-section": "Remove empty sections or fill them with content — blank areas look broken.",
  "layout.broken-links": "Fix placeholder links by pointing them to real URLs or using #section-id anchors.",
  "layout.template-markers": "Replace template placeholders like {{...}} with your actual content.",
  "a11y.missing-alt": "Add descriptive alt text to all images so screen reader users know what they show.",
  "a11y.form-labels": "Add labels to form inputs so users know what each field is for.",
  "a11y.contrast": "Increase the contrast between text and background colors for better readability.",
  "seo.no-title": "Add a descriptive title tag — it's the first thing people see in search results.",
  "seo.no-description": "Write a meta description so search engines can summarize your page in results.",
  "seo.open-graph": "Add OpenGraph tags (og:title, og:description, og:image) for better social media sharing.",
  "perf.html-size": "Reduce your HTML size by removing unnecessary markup or inlined styles.",
  "perf.blocking-scripts": "Add defer or async attributes to external scripts so they don't block page rendering.",
  "perf.font-count": "Limit web fonts to 2 or fewer — each font file adds loading time.",
};

export function generateSuggestions(categories: QACategory[]): string[] {
  const suggestions: string[] = [];
  const seen = new Set<string>();

  // Sort categories by score (worst first) to prioritize fixes
  const sorted = [...categories].sort((a, b) => a.score - b.score);

  for (const category of sorted) {
    // Sort issues: fail first, then warn, then info
    const severityOrder = { fail: 0, warn: 1, info: 2 };
    const sortedIssues = [...category.issues].sort(
      (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
    );

    for (const issue of sortedIssues) {
      const suggestion = SUGGESTION_MAP[issue.id];
      if (suggestion && !seen.has(issue.id)) {
        seen.add(issue.id);
        suggestions.push(suggestion);
        if (suggestions.length >= 5) return suggestions;
      }
    }
  }

  if (suggestions.length === 0) {
    suggestions.push("Your page looks good! Keep testing on real devices to make sure everything works.");
  }

  return suggestions;
}
