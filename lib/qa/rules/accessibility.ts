import type { QAIssue } from "../types";

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseColor(color: string): [number, number, number] | null {
  const hexMatch = color.match(/^#([a-f0-9]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  const shortHex = color.match(/^#([a-f0-9]{3})$/i);
  if (shortHex) {
    const hex = shortHex[1];
    return [
      parseInt(hex[0] + hex[0], 16),
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16),
    ];
  }
  const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  }
  return null;
}

export function runAccessibilityChecks(html: string): QAIssue[] {
  const issues: QAIssue[] = [];

  // 1. Alt text on images
  const imgRegex = /<img\b([^>]*)>/gi;
  let imgMatch;
  let missingAlt = 0;
  let totalImages = 0;
  let firstMissingSelector: string | null = null;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    totalImages++;
    const attrs = imgMatch[1];
    const hasAlt = /alt\s*=/i.test(attrs);
    if (!hasAlt) {
      missingAlt++;
      if (!firstMissingSelector) {
        const classMatch = attrs.match(/class=["']([^"']*)["']/i);
        const idMatch = attrs.match(/id=["']([^"']*)["']/i);
        firstMissingSelector = idMatch ? `img#${idMatch[1].split(/\s/)[0]}` : classMatch ? `img.${classMatch[1].split(/\s/)[0]}` : "img";
      }
    }
  }
  if (missingAlt > 0) {
    issues.push({
      id: "a11y.missing-alt",
      severity: "fail",
      selector: firstMissingSelector,
      title: "Images missing alt text",
      detail: `${missingAlt} of ${totalImages} images have no alt attribute — screen readers can't describe them.`,
    });
  }

  // 2. Form labels
  const inputRegex = /<input\b([^>]*)>/gi;
  let inputMatch;
  let unlabeledInputs = 0;
  while ((inputMatch = inputRegex.exec(html)) !== null) {
    const attrs = inputMatch[1];
    if (/type\s*=\s*["'](?:hidden|submit|button|image|reset)["']/i.test(attrs)) continue;
    const hasId = /id\s*=\s*["']([^"']*)["']/i.test(attrs);
    const hasAriaLabel = /aria-label\s*=/i.test(attrs);
    const hasAriaLabelledby = /aria-labelledby\s*=/i.test(attrs);
    if (!hasAriaLabel && !hasAriaLabelledby) {
      if (hasId) {
        const idMatch2 = attrs.match(/id\s*=\s*["']([^"']*)["']/i);
        if (idMatch2) {
          const labelRegex = new RegExp(`<label[^>]*for\\s*=\\s*["']${idMatch2[1]}["']`, "i");
          if (!labelRegex.test(html)) unlabeledInputs++;
        }
      } else {
        unlabeledInputs++;
      }
    }
  }
  if (unlabeledInputs > 0) {
    issues.push({
      id: "a11y.form-labels",
      severity: "warn",
      selector: "input",
      title: "Form inputs without labels",
      detail: `${unlabeledInputs} input${unlabeledInputs > 1 ? "s have" : " has"} no associated label or aria-label.`,
    });
  }

  // 3. Color contrast (simplified — check common text/background pairs)
  const textColorMatch = html.match(/body\s*\{[^}]*color:\s*([^;}\s]+)/i);
  const bgColorMatch = html.match(/body\s*\{[^}]*background(?:-color)?:\s*([^;}\s]+)/i);
  if (textColorMatch && bgColorMatch) {
    const textRgb = parseColor(textColorMatch[1]);
    const bgRgb = parseColor(bgColorMatch[1]);
    if (textRgb && bgRgb) {
      const ratio = contrastRatio(
        luminance(...textRgb),
        luminance(...bgRgb)
      );
      if (ratio < 4.5) {
        issues.push({
          id: "a11y.contrast",
          severity: "warn",
          selector: "body",
          title: "Low color contrast",
          detail: `Text-to-background contrast ratio is ${ratio.toFixed(1)}:1 — minimum for normal text is 4.5:1.`,
        });
      }
    }
  }

  // 4. Focus-visible styles
  const hasFocusVisible = /:focus-visible|:focus\s*\{/i.test(html);
  if (!hasFocusVisible) {
    issues.push({
      id: "a11y.focus-visible",
      severity: "info",
      selector: null,
      title: "No focus-visible styles",
      detail: "Keyboard users need visible focus indicators — add :focus-visible styles for interactive elements.",
    });
  }

  // 5. Language attribute
  if (!/<html[^>]*lang\s*=/i.test(html)) {
    issues.push({
      id: "a11y.lang-attr",
      severity: "warn",
      selector: "html",
      title: "Missing lang attribute",
      detail: "The <html> tag should have a lang attribute so screen readers know the page language.",
    });
  }

  return issues;
}
