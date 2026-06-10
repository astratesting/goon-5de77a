export interface QACheck {
  name: string;
  status: "pass" | "warn" | "fail";
  value: string;
  detail: string;
}

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

export function runLayoutChecks(
  html: string,
  prompt: string
): QACheck[] {
  const checks: QACheck[] = [];

  // Count sections
  const sectionMatches = html.match(/<section[^>]*data-section-type="[^"]*"|<footer[^>]*data-section-type="[^"]*"/g);
  const sectionCount = sectionMatches ? sectionMatches.length : 0;

  if (sectionCount > 8) {
    checks.push({
      name: "Section count",
      status: "fail",
      value: `${sectionCount} sections`,
      detail: "Too many sections can confuse visitors.",
    });
  } else if (sectionCount < 2) {
    checks.push({
      name: "Section count",
      status: "warn",
      value: `${sectionCount} section`,
      detail: "A landing page typically has at least 2 sections.",
    });
  } else {
    checks.push({
      name: "Section count",
      status: "pass",
      value: `${sectionCount} sections`,
      detail: "Good number of sections.",
    });
  }

  // Check for empty sections
  const emptySectionMatch = html.match(
    /<section[^>]*>([\s\S]*?)<\/section>/g
  );
  let hasEmptySection = false;
  if (emptySectionMatch) {
    for (const section of emptySectionMatch) {
      const textContent = section.replace(/<[^>]+>/g, "").trim();
      if (textContent.length < 5) {
        hasEmptySection = true;
        break;
      }
    }
  }
  checks.push({
    name: "Empty sections",
    status: hasEmptySection ? "fail" : "pass",
    value: hasEmptySection ? "Found" : "None",
    detail: hasEmptySection
      ? "One or more sections have no visible content."
      : "All sections have content.",
  });

  // Check for duplicate section types
  const types = sectionMatches?.map((m) => {
    const match = m.match(/data-section-type="([^"]*)"/);
    return match ? match[1] : "";
  }) || [];
  let hasDuplicate = false;
  for (let i = 1; i < types.length; i++) {
    if (types[i] === types[i - 1] && types[i] !== "custom") {
      hasDuplicate = true;
      break;
    }
  }
  checks.push({
    name: "Duplicate sections",
    status: hasDuplicate ? "warn" : "pass",
    value: hasDuplicate ? "Found" : "None",
    detail: hasDuplicate
      ? "Two identical section types appear back-to-back."
      : "No duplicate consecutive sections.",
  });

  // Check for broken links
  const linkMatches = html.matchAll(/<a\s+[^>]*href="([^"]*)"[^>]*>/g);
  let brokenLinks = 0;
  for (const match of linkMatches) {
    const href = match[1];
    if (BROKEN_LINK_PATTERNS.some((p) => p.test(href))) {
      brokenLinks++;
    }
  }
  checks.push({
    name: "Broken links",
    status: brokenLinks > 0 ? "fail" : "pass",
    value: brokenLinks > 0 ? `${brokenLinks} found` : "None",
    detail: brokenLinks > 0
      ? "Some links have empty or placeholder URLs."
      : "All links have valid href values.",
  });

  // Check for placeholder/template markers
  const textContent = html.replace(/<[^>]+>/g, "");
  let hasPlaceholder = false;
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(textContent)) {
      hasPlaceholder = true;
      break;
    }
  }
  checks.push({
    name: "Template markers",
    status: hasPlaceholder ? "fail" : "pass",
    value: hasPlaceholder ? "Found" : "None",
    detail: hasPlaceholder
      ? "Page contains unrendered template placeholders."
      : "No template markers found.",
  });

  // Check for prompt echo
  const promptSnippet = prompt.slice(0, 80).toLowerCase();
  const bodyLower = html.toLowerCase();
  const hasPromptEcho = promptSnippet.length > 20 && bodyLower.includes(promptSnippet);
  checks.push({
    name: "Prompt echo",
    status: hasPromptEcho ? "warn" : "pass",
    value: hasPromptEcho ? "Detected" : "None",
    detail: hasPromptEcho
      ? "The prompt text appears verbatim in the page body."
      : "No prompt echo detected.",
  });

  return checks;
}
