import type { QAIssue } from "../types";

const PLACEHOLDER_PATTERNS = [
  /\{\{.*?\}\}/g,
  /\[your\s[^\]]*\]/gi,
  /\[insert\s[^\]]*\]/gi,
  /lorem\s+ipsum/gi,
];

const BROKEN_LINK_PATTERNS = [
  /^javascript:/i,
  /^$/,
  /^\{\{.*\}\}$/,
  /^\[.*\]$/,
];

export function runLayoutChecks(html: string, prompt: string): QAIssue[] {
  const issues: QAIssue[] = [];

  // 1. Section count
  const sectionMatches = html.match(/<section[^>]*data-section-type="[^"]*"|<footer[^>]*data-section-type="[^"]*"/g);
  const sectionCount = sectionMatches ? sectionMatches.length : 0;

  if (sectionCount > 8) {
    issues.push({
      id: "layout.section-count",
      severity: "warn",
      selector: null,
      title: "Too many sections",
      detail: "A page with more than 8 sections can overwhelm visitors.",
    });
  } else if (sectionCount < 2) {
    issues.push({
      id: "layout.section-count",
      severity: "warn",
      selector: null,
      title: "Too few sections",
      detail: "A landing page typically has at least 2 sections to tell a complete story.",
    });
  }

  // 2. Empty sections
  const emptySectionMatch = html.match(/<section[^>]*>([\s\S]*?)<\/section>/g);
  if (emptySectionMatch) {
    for (let i = 0; i < emptySectionMatch.length; i++) {
      const section = emptySectionMatch[i];
      const textContent = section.replace(/<[^>]+>/g, "").trim();
      if (textContent.length < 5) {
        const typeMatch = section.match(/data-section-type="([^"]*)"/);
        const sectionType = typeMatch ? typeMatch[1] : "unknown";
        issues.push({
          id: "layout.empty-section",
          severity: "fail",
          selector: `[data-section-type="${sectionType}"]`,
          title: "Empty section found",
          detail: `The ${sectionType} section has almost no text content — visitors will see a blank area.`,
        });
        break;
      }
    }
  }

  // 3. Duplicate sections
  const sectionTypes: string[] = [];
  if (sectionMatches) {
    for (const match of sectionMatches) {
      const typeMatch = match.match(/data-section-type="([^"]*)"/);
      if (typeMatch) sectionTypes.push(typeMatch[1]);
    }
  }
  for (let i = 1; i < sectionTypes.length; i++) {
    if (sectionTypes[i] === sectionTypes[i - 1] && sectionTypes[i] !== "custom") {
      issues.push({
        id: "layout.duplicate-section",
        severity: "warn",
        selector: `[data-section-type="${sectionTypes[i]}"]`,
        title: "Duplicate sections",
        detail: `Two ${sectionTypes[i]} sections appear in a row — consider merging or removing one.`,
      });
      break;
    }
  }

  // 4. Broken links
  const linkRegex = /href=["']([^"']*)["']/gi;
  let linkMatch;
  const brokenLinks: string[] = [];
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1];
    for (const pattern of BROKEN_LINK_PATTERNS) {
      if (pattern.test(href)) {
        brokenLinks.push(href);
        break;
      }
    }
  }
  if (brokenLinks.length > 0) {
    issues.push({
      id: "layout.broken-links",
      severity: "fail",
      selector: "a",
      title: "Broken or placeholder links",
      detail: `${brokenLinks.length} link${brokenLinks.length > 1 ? "s have" : " has"} empty or placeholder URLs.`,
    });
  }

  // 5. Template markers
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(html)) {
      issues.push({
        id: "layout.template-markers",
        severity: "fail",
        selector: null,
        title: "Placeholder text found",
        detail: "The page still contains template placeholders like {{...}} or [your ...] — replace with real content.",
      });
      break;
    }
  }

  // 6. Prompt echo
  if (prompt && prompt.length > 20) {
    const promptStart = prompt.slice(0, 80).toLowerCase();
    const htmlLower = html.toLowerCase();
    if (htmlLower.includes(promptStart)) {
      issues.push({
        id: "layout.prompt-echo",
        severity: "warn",
        selector: null,
        title: "Prompt text echoed in page",
        detail: "Your original prompt text appears verbatim in the page — rewrite it for visitors.",
      });
    }
  }

  // 7. Max-width consistency
  const hasContainer = /max-width:\s*\d+px/i.test(html);
  if (!hasContainer) {
    issues.push({
      id: "layout.no-max-width",
      severity: "warn",
      selector: null,
      title: "No content width constraint",
      detail: "Text lines may get very long on wide screens — add a max-width to keep content readable.",
    });
  }

  // 8. Z-index check
  const zIndexRegex = /z-index:\s*(\d+)/g;
  let zMatch;
  while ((zMatch = zIndexRegex.exec(html)) !== null) {
    const z = parseInt(zMatch[1], 10);
    if (z > 50) {
      const isModal = /modal|overlay|dialog|popup/i.test(html.slice(Math.max(0, zMatch.index - 200), zMatch.index + 200));
      if (!isModal) {
        issues.push({
          id: "layout.z-index",
          severity: "info",
          selector: null,
          title: "High z-index detected",
          detail: "A z-index above 50 was found outside a modal context — may cause layering issues.",
        });
        break;
      }
    }
  }

  return issues;
}
