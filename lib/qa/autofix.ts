import type { QAIssue } from "./types";

export function applyAutoFix(html: string, issue: QAIssue): string {
  if (!issue.autoFix) return html;

  switch (issue.autoFix.action) {
    case "add-viewport":
      return fixAddViewport(html);
    case "bump-padding":
      return fixBumpPadding(html, issue.selector);
    case "lazy-load":
      return fixLazyLoad(html, issue.selector);
    case "set-srcset":
      return fixSetSrcset(html, issue.selector);
    default:
      return html;
  }
}

function fixAddViewport(html: string): string {
  const existingMeta = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i);
  if (existingMeta) {
    return html.replace(
      existingMeta[0],
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    );
  }
  return html.replace(
    /<\/head>/i,
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>'
  );
}

function fixBumpPadding(html: string, selector: string | null): string {
  if (!selector) return html;

  // For elements with inline styles, bump padding
  const regex = /(<(?:a|button|input)\b[^>]*style=["'])([^"']*?)(["'][^>]*>)/gi;
  return html.replace(regex, (match, prefix, style, suffix) => {
    if (!/padding/i.test(style)) {
      return `${prefix}padding: 12px 20px; ${style}${suffix}`;
    }
    // Replace small padding values
    const newStyle = style.replace(
      /padding(?:-(?:top|bottom))?:\s*(\d+)px/gi,
      (m: string, val: string) => {
        const num = parseInt(val, 10);
        if (num < 12) return m.replace(val, "12");
        return m;
      }
    );
    return `${prefix}${newStyle}${suffix}`;
  });
}

function fixLazyLoad(html: string, selector: string | null): string {
  if (!selector) {
    // Add lazy loading to all images
    return html.replace(/<img\b(?![^>]*loading=)([^>]*)>/gi, (match, attrs) => {
      return `<img loading="lazy"${attrs}>`;
    });
  }

  // Add lazy loading to specific image
  return html.replace(/<img\b(?![^>]*loading=)([^>]*)>/gi, (match, attrs) => {
    if (match.includes(selector) || selector === "img") {
      return `<img loading="lazy"${attrs}>`;
    }
    return match;
  });
}

function fixSetSrcset(html: string, selector: string | null): string {
  return html.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    const srcMatch = attrs.match(/src=["']([^"']*)["']/i);
    if (!srcMatch) return match;
    if (/srcset\s*=/i.test(match)) return match;

    const src = srcMatch[1];
    const srcset = `${src} 1x`;
    return match.replace(srcMatch[0], `${srcMatch[0]} srcset="${srcset}" sizes="100vw"`);
  });
}

export function getFixDescription(action: string): string {
  switch (action) {
    case "add-viewport":
      return "Added viewport meta tag";
    case "bump-padding":
      return "Increased padding for better tap targets";
    case "lazy-load":
      return "Added lazy loading to images";
    case "set-srcset":
      return "Added srcset and sizes attributes to images";
    default:
      return "Applied automatic fix";
  }
}
