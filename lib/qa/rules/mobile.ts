import type { QAIssue } from "../types";

function extractViewport(html: string): string | null {
  const match = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']viewport["'][^>]*>/i);
  return match ? match[1] : null;
}

function extractStyles(html: string): string {
  let css = "";
  const styleBlocks = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleBlocks) {
    for (const block of styleBlocks) {
      const inner = block.replace(/<\/?style[^>]*>/gi, "");
      css += inner + "\n";
    }
  }
  return css;
}

function extractInteractiveElements(html: string): Array<{ tag: string; selector: string; html: string }> {
  const elements: Array<{ tag: string; selector: string; html: string }> = [];
  const patterns = [
    { regex: /<a\b([^>]*)>([\s\S]*?)<\/a>/gi, tag: "a" },
    { regex: /<button\b([^>]*)>([\s\S]*?)<\/button>/gi, tag: "button" },
    { regex: /<input\b([^>]*)>/gi, tag: "input" },
  ];
  let idx = 0;
  for (const { regex, tag } of patterns) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      const attrs = match[1] || "";
      const roleMatch = attrs.match(/role=["']([^"']*)["']/i);
      const classMatch = attrs.match(/class=["']([^"']*)["']/i);
      const idMatch = attrs.match(/id=["']([^"']*)["']/i);
      let selector = tag;
      if (idMatch) selector = `${tag}#${idMatch[1].split(/\s/)[0]}`;
      else if (classMatch) selector = `${tag}.${classMatch[1].split(/\s/)[0]}`;
      elements.push({ tag: roleMatch?.[1] === "button" ? "button" : tag, selector, html: match[0] });
      idx++;
    }
  }
  return elements;
}

function extractImages(html: string): Array<{ src: string; attrs: string; selector: string }> {
  const images: Array<{ src: string; attrs: string; selector: string }> = [];
  const regex = /<img\b([^>]*)>/gi;
  let match;
  let idx = 0;
  while ((match = regex.exec(html)) !== null) {
    const attrs = match[1];
    const srcMatch = attrs.match(/src=["']([^"']*)["']/i);
    const classMatch = attrs.match(/class=["']([^"']*)["']/i);
    const idMatch = attrs.match(/id=["']([^"']*)["']/i);
    let selector = `img`;
    if (idMatch) selector = `img#${idMatch[1].split(/\s/)[0]}`;
    else if (classMatch) selector = `img.${classMatch[1].split(/\s/)[0]}`;
    else selector = `img:nth-of-type(${idx + 1})`;
    images.push({
      src: srcMatch ? srcMatch[1] : "",
      attrs,
      selector,
    });
    idx++;
  }
  return images;
}

function parsePaddingFromStyle(styleAttr: string): { top: number; bottom: number; left: number; right: number } {
  const padding = { top: 8, bottom: 8, left: 8, right: 8 };
  const allMatch = styleAttr.match(/padding:\s*(\d+)px/);
  if (allMatch) {
    const val = parseInt(allMatch[1], 10);
    padding.top = padding.bottom = padding.left = padding.right = val;
  }
  const yMatch = styleAttr.match(/padding-top:\s*(\d+)px/i);
  if (yMatch) padding.top = parseInt(yMatch[1], 10);
  const bMatch = styleAttr.match(/padding-bottom:\s*(\d+)px/i);
  if (bMatch) padding.bottom = parseInt(bMatch[1], 10);
  return padding;
}

function estimateTouchTargetSize(elHtml: string, css: string): { width: number; height: number } {
  const styleMatch = elHtml.match(/style=["']([^"']*)["']/i);
  const style = styleMatch ? styleMatch[1] : "";
  const padding = parsePaddingFromStyle(style);

  const minHeight = 16 + padding.top + padding.bottom;
  const minWidth = 16 + padding.left + padding.right;

  return { width: Math.max(minWidth, 40), height: Math.max(minHeight, 40) };
}

export function runMobileChecks(html: string): QAIssue[] {
  const issues: QAIssue[] = [];
  const css = extractStyles(html);

  // 1. viewport-meta check
  const viewport = extractViewport(html);
  if (!viewport) {
    issues.push({
      id: "mobile.viewport-meta",
      severity: "fail",
      selector: "meta[name=viewport]",
      title: "Missing viewport meta",
      detail: "Without a viewport meta tag, your page won't scale correctly on mobile devices.",
      autoFix: { action: "add-viewport" },
    });
  } else {
    if (!viewport.includes("width=device-width")) {
      issues.push({
        id: "mobile.viewport-meta",
        severity: "fail",
        selector: "meta[name=viewport]",
        title: "Viewport missing device-width",
        detail: "The viewport meta tag should include width=device-width for proper mobile scaling.",
        autoFix: { action: "add-viewport" },
      });
    }
    if (viewport.includes("user-scalable=no") || viewport.includes("user-scalable=0")) {
      issues.push({
        id: "mobile.viewport-zoom",
        severity: "warn",
        selector: "meta[name=viewport]",
        title: "Zoom disabled for users",
        detail: "Disabling zoom hurts accessibility — users who need larger text can't zoom in.",
      });
    }
    if (viewport.includes("maximum-scale=1")) {
      issues.push({
        id: "mobile.viewport-zoom",
        severity: "warn",
        selector: "meta[name=viewport]",
        title: "Zoom limited to 1x",
        detail: "Limiting maximum scale to 1 prevents users from zooming, which is an accessibility concern.",
      });
    }
  }

  // 2. responsive-css check
  const hasMediaQuery = /@media\s*\(/i.test(css) || /@media\s*\(/i.test(html);
  const hasClamp = /clamp\s*\(/i.test(css);
  const hasVwVh = /\d+(\.\d+)?(vw|vh)/i.test(css);
  const hasPercent = /:\s*\d+(\.\d+)?%/i.test(css);
  const hasFlexGrid = /display:\s*(flex|grid)/i.test(css);
  const responsiveTokens = [hasMediaQuery, hasClamp, hasVwVh, hasPercent, hasFlexGrid].filter(Boolean).length;

  if (responsiveTokens === 0) {
    issues.push({
      id: "mobile.responsive-css",
      severity: "fail",
      selector: "style",
      title: "No responsive CSS detected",
      detail: "No media queries, clamp(), vw/vh units, or flex/grid found — layout likely won't adapt to mobile.",
    });
  }

  // Check for large fixed-width elements
  const fixedWidthRegex = /width:\s*(\d+)px/g;
  let fixedMatch;
  let hasLargeFixed = false;
  while ((fixedMatch = fixedWidthRegex.exec(css)) !== null) {
    const w = parseInt(fixedMatch[1], 10);
    if (w > 360) {
      hasLargeFixed = true;
      break;
    }
  }
  if (hasLargeFixed) {
    issues.push({
      id: "mobile.responsive-css-fixed",
      severity: "fail",
      selector: null,
      title: "Fixed-width element too wide for mobile",
      detail: "An element has a fixed width exceeding 360px with no responsive counterpart — it will overflow on small screens.",
    });
  }

  // 3. touch-targets check
  const interactiveElements = extractInteractiveElements(html);
  const smallTargets: Array<{ selector: string; size: { width: number; height: number } }> = [];

  for (const el of interactiveElements) {
    const size = estimateTouchTargetSize(el.html, css);
    if (size.width < 44 || size.height < 44) {
      smallTargets.push({ selector: el.selector, size });
    }
  }

  if (smallTargets.length > 0) {
    const worstTarget = smallTargets.reduce((min, t) =>
      (t.size.width * t.size.height) < (min.size.width * min.size.height) ? t : min
    );
    issues.push({
      id: "mobile.touch-target",
      severity: smallTargets.length > 3 ? "fail" : "warn",
      selector: worstTarget.selector,
      title: "Tap target too small",
      detail: `${smallTargets.length} interactive element${smallTargets.length > 1 ? "s are" : " is"} smaller than 44×44px — hard to tap on mobile.`,
      autoFix: { action: "bump-padding" },
    });
  }

  // 4. image-scaling check
  const images = extractImages(html);
  for (const img of images) {
    const hasSrcset = /srcset\s*=/i.test(img.attrs);
    const hasSizes = /sizes\s*=/i.test(img.attrs);
    const hasMaxWidth = /max-width\s*:\s*100%/i.test(img.attrs) || /max-width\s*:\s*100%/i.test(css);
    const hasLoading = /loading\s*=/i.test(img.attrs);

    if (!hasSrcset && !hasSizes && !hasMaxWidth) {
      issues.push({
        id: "mobile.image-scaling",
        severity: "warn",
        selector: img.selector,
        title: "Image may overflow on mobile",
        detail: "This image doesn't have srcset, sizes, or max-width:100% — it might overflow its container on small screens.",
        autoFix: { action: "set-srcset" },
      });
    }

    if (!hasLoading) {
      issues.push({
        id: "mobile.image-lazy",
        severity: "info",
        selector: img.selector,
        title: "Image missing lazy loading",
        detail: "Adding loading=\"lazy\" improves page load speed by deferring off-screen images.",
        autoFix: { action: "lazy-load" },
      });
    }
  }

  // 5. horizontal-overflow check
  const has100vw = /width:\s*100vw/i.test(css);
  const hasNegativeMargin = /margin-left:\s*-\d+px/i.test(css) || /margin-right:\s*-\d+px/i.test(css);
  if (has100vw || hasNegativeMargin || hasLargeFixed) {
    issues.push({
      id: "mobile.horizontal-overflow",
      severity: "fail",
      selector: null,
      title: "Horizontal overflow likely",
      detail: "The page may scroll horizontally on mobile due to wide elements or negative margins.",
    });
  }

  // 6. font-sizes check
  const fontSizeRegex = /font-size:\s*([\d.]+)(px|rem|em)/g;
  let fontMatch;
  let hasTinyFont = false;
  while ((fontMatch = fontSizeRegex.exec(css)) !== null) {
    const val = parseFloat(fontMatch[1]);
    const unit = fontMatch[2];
    let px = val;
    if (unit === "rem" || unit === "em") px = val * 16;
    if (px < 12) {
      hasTinyFont = true;
      break;
    }
  }
  if (hasTinyFont) {
    issues.push({
      id: "mobile.font-sizes",
      severity: "warn",
      selector: null,
      title: "Text too small on mobile",
      detail: "Some text is below 12px — it will be very hard to read on a phone screen.",
    });
  }

  return issues;
}
