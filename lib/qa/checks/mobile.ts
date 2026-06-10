export interface MobileCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  value: string;
  detail: string;
  viewport: string;
}

// Static analysis of mobile responsiveness from HTML content
// In production, this would use Playwright to render and measure.
// This implementation performs static heuristic checks on the HTML.

export function runMobileChecks(html: string): MobileCheck[] {
  const checks: MobileCheck[] = [];

  // Check for viewport meta tag
  const hasViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html);
  checks.push({
    name: "Viewport meta",
    status: hasViewport ? "pass" : "fail",
    value: hasViewport ? "Present" : "Missing",
    detail: hasViewport
      ? "Page has a viewport meta tag."
      : "Missing viewport meta tag — page may not scale on mobile.",
    viewport: "375px",
  });

  // Check for responsive CSS (media queries)
  const mediaQueryCount = (html.match(/@media/g) || []).length;
  checks.push({
    name: "Media queries",
    status: mediaQueryCount >= 1 ? "pass" : "warn",
    value: `${mediaQueryCount} found`,
    detail: mediaQueryCount >= 1
      ? "Page uses media queries for responsive layout."
      : "No media queries found — layout may not adapt to mobile.",
    viewport: "375px",
  });

  // Check for fixed widths that could cause horizontal overflow
  const fixedWidthMatch = html.match(/width:\s*(\d+)px/g);
  let hasFixedOverflow = false;
  if (fixedWidthMatch) {
    for (const match of fixedWidthMatch) {
      const num = parseInt(match.replace(/\D/g, ""), 10);
      if (num > 400) {
        hasFixedOverflow = true;
        break;
      }
    }
  }
  checks.push({
    name: "Horizontal overflow",
    status: hasFixedOverflow ? "fail" : "pass",
    value: hasFixedOverflow ? "Risk detected" : "None",
    detail: hasFixedOverflow
      ? "Found fixed-width elements that may overflow on 375px screens."
      : "No fixed widths exceeding mobile viewport.",
    viewport: "375px",
  });

  // Check for font sizes too small for mobile
  const fontSizeMatch = html.match(/font-size:\s*([\d.]+)(px|rem|em)/g);
  let hasSmallText = false;
  if (fontSizeMatch) {
    for (const match of fontSizeMatch) {
      const val = parseFloat(match.replace(/[^\d.]/g, ""));
      const unit = match.includes("rem") ? "rem" : match.includes("em") ? "em" : "px";
      const pxValue =
        unit === "px" ? val : unit === "rem" ? val * 16 : val * 16;
      if (pxValue < 12 && pxValue > 0) {
        hasSmallText = true;
        break;
      }
    }
  }
  checks.push({
    name: "Text legibility",
    status: hasSmallText ? "fail" : "pass",
    value: hasSmallText ? "Too small" : "OK",
    detail: hasSmallText
      ? "Some text is below 12px — hard to read on mobile."
      : "All text meets minimum legibility size.",
    viewport: "375px",
  });

  // Check for touch targets (buttons, links with padding)
  const buttonMatch = html.match(/<button[^>]*>|<a[^>]*class="btn[^"]*"[^>]*>/g);
  const buttonCount = buttonMatch ? buttonMatch.length : 0;
  checks.push({
    name: "Touch targets",
    status: buttonCount > 0 ? "pass" : "warn",
    value: `${buttonCount} interactive elements`,
    detail: buttonCount > 0
      ? "Interactive elements found with button styling."
      : "No interactive elements detected.",
    viewport: "375px",
  });

  // Check for images without max-width
  const imgTags = html.match(/<img[^>]*>/g) || [];
  let imagesWithoutMaxWidth = 0;
  for (const img of imgTags) {
    if (!img.includes("max-width") && !html.includes("img {") && !html.includes("img{")) {
      imagesWithoutMaxWidth++;
    }
  }
  checks.push({
    name: "Image responsiveness",
    status: imgTags.length > 0 && imagesWithoutMaxWidth > 0 ? "warn" : "pass",
    value: imgTags.length > 0 ? `${imgTags.length} images` : "No images",
    detail: imgTags.length === 0
      ? "No images to check."
      : imagesWithoutMaxWidth > 0
        ? "Some images may not scale on mobile."
        : "Images are responsive.",
    viewport: "768px",
  });

  // Tablet check - CSS grid/flex for tablet breakpoint
  const hasGridOrFlex = /display:\s*(grid|flex)/g.test(html);
  checks.push({
    name: "Layout adaptability",
    status: hasGridOrFlex ? "pass" : "warn",
    value: hasGridOrFlex ? "Flex/Grid found" : "Block layout",
    detail: hasGridOrFlex
      ? "Uses flex/grid layouts that adapt to screen sizes."
      : "Consider using flex or grid for better tablet layout.",
    viewport: "768px",
  });

  return checks;
}
