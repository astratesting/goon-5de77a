import type { QAIssue } from "../types";

export function runTypographyChecks(html: string): QAIssue[] {
  const issues: QAIssue[] = [];

  // 1. Heading hierarchy — one h1, no skipped levels
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const h3Count = (html.match(/<h3[\s>]/gi) || []).length;
  const h4Count = (html.match(/<h4[\s>]/gi) || []).length;

  if (h1Count === 0) {
    issues.push({
      id: "typography.no-h1",
      severity: "fail",
      selector: null,
      title: "Missing H1 heading",
      detail: "Every page needs exactly one H1 for structure and SEO.",
    });
  } else if (h1Count > 1) {
    issues.push({
      id: "typography.multiple-h1",
      severity: "warn",
      selector: "h1",
      title: "Multiple H1 headings",
      detail: `Found ${h1Count} H1 tags — there should be exactly one per page.`,
    });
  }

  // Check for skipped heading levels
  if (h3Count > 0 && h2Count === 0) {
    issues.push({
      id: "typography.skipped-level",
      severity: "warn",
      selector: "h3",
      title: "Skipped heading level",
      detail: "H3 is used but no H2 exists — heading levels should go in order.",
    });
  }
  if (h4Count > 0 && h3Count === 0) {
    issues.push({
      id: "typography.skipped-level",
      severity: "warn",
      selector: "h4",
      title: "Skipped heading level",
      detail: "H4 is used but no H3 exists — heading levels should go in order.",
    });
  }

  // 2. Line-height check for body text
  const lineHeightMatch = html.match(/body\s*\{[^}]*line-height:\s*([\d.]+)/i);
  if (lineHeightMatch) {
    const lh = parseFloat(lineHeightMatch[1]);
    if (lh < 1.2 || lh > 1.6) {
      issues.push({
        id: "typography.line-height",
        severity: "warn",
        selector: "body",
        title: "Body line-height outside ideal range",
        detail: `Body line-height is ${lh} — ideal range for readability is 1.2 to 1.6.`,
      });
    }
  }

  // 3. Check for justified text (harder to read on web)
  const hasJustified = /text-align:\s*justify/i.test(html);
  if (hasJustified) {
    issues.push({
      id: "typography.justified",
      severity: "warn",
      selector: null,
      title: "Justified text alignment",
      detail: "Justified text creates uneven word spacing that hurts readability on the web.",
    });
  }

  // 4. Check heading font sizes are reasonable
  const headingSizeRegex = /h[1-6]\s*\{[^}]*font-size:\s*([\d.]+)(px|rem|em)/gi;
  let hMatch;
  while ((hMatch = headingSizeRegex.exec(html)) !== null) {
    const val = parseFloat(hMatch[1]);
    const unit = hMatch[2];
    let px = val;
    if (unit === "rem" || unit === "em") px = val * 16;
    if (px < 16) {
      issues.push({
        id: "typography.small-heading",
        severity: "warn",
        selector: null,
        title: "Small heading text",
        detail: "A heading is smaller than 16px — headings should stand out from body text.",
      });
      break;
    }
  }

  return issues;
}
