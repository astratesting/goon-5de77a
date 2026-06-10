import type { QAIssue } from "../types";

export function runPerformanceChecks(html: string): QAIssue[] {
  const issues: QAIssue[] = [];

  // 1. Total HTML size
  const sizeBytes = new TextEncoder().encode(html).length;
  const sizeKB = Math.round(sizeBytes / 1024);
  if (sizeKB > 150) {
    issues.push({
      id: "perf.html-size",
      severity: sizeKB > 300 ? "fail" : "warn",
      selector: null,
      title: "Large HTML size",
      detail: `HTML is ${sizeKB}KB — keep it under 150KB for fast initial load.`,
    });
  }

  // 2. Image count
  const imgCount = (html.match(/<img\b/gi) || []).length;
  if (imgCount > 20) {
    issues.push({
      id: "perf.image-count",
      severity: "warn",
      selector: null,
      title: "Too many images",
      detail: `Found ${imgCount} images — consider lazy loading or reducing image count for faster load.`,
    });
  }

  // 3. Render-blocking external scripts
  const externalScripts = html.match(/<script[^>]*src=["'][^"']*["'][^>]*>/gi) || [];
  const blockingScripts = externalScripts.filter((s) => !/defer|async/i.test(s));
  if (blockingScripts.length > 0) {
    issues.push({
      id: "perf.blocking-scripts",
      severity: "warn",
      selector: "script[src]",
      title: "Render-blocking scripts",
      detail: `${blockingScripts.length} external script${blockingScripts.length > 1 ? "s are" : " is"} loading without defer or async — this blocks page rendering.`,
    });
  }

  // 4. Font count
  const fontImports = html.match(/@import\s+url\(["']?[^"')]*["']?\)/gi) || [];
  const fontFaces = html.match(/@font-face/gi) || [];
  const fontLinks = html.match(/<link[^>]*fonts\.googleapis/i) || [];
  const totalFonts = fontImports.length + fontFaces.length + fontLinks.length;
  if (totalFonts > 2) {
    issues.push({
      id: "perf.font-count",
      severity: "warn",
      selector: null,
      title: "Too many web fonts",
      detail: `Loading ${totalFonts} font sources — each one adds latency. Limit to 2 for best performance.`,
    });
  }

  // 5. Inline CSS size
  const styleBlocks = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  let totalCSS = 0;
  for (const block of styleBlocks) {
    totalCSS += new TextEncoder().encode(block).length;
  }
  const cssKB = Math.round(totalCSS / 1024);
  if (cssKB > 50) {
    issues.push({
      id: "perf.css-size",
      severity: "warn",
      selector: "style",
      title: "Large inline CSS",
      detail: `Inline CSS is ${cssKB}KB — consider splitting critical and non-critical styles.`,
    });
  }

  // 6. Check for unoptimized images (no loading="lazy" on likely below-fold images)
  const allImgs = html.match(/<img\b[^>]*>/gi) || [];
  if (allImgs.length > 2) {
    const noLazy = allImgs.slice(2).filter((img) => !/loading\s*=\s*["']lazy["']/i.test(img));
    if (noLazy.length > 0) {
      issues.push({
        id: "perf.lazy-loading",
        severity: "info",
        selector: "img",
        title: "Below-fold images not lazy loaded",
        detail: `${noLazy.length} images below the fold could use loading="lazy" to improve initial load time.`,
      });
    }
  }

  return issues;
}
