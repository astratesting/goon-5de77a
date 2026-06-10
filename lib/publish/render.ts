import { db } from "@/lib/db";

export async function renderPageForPreview(pageId: string): Promise<string | null> {
  const page = await db.page.findUnique({
    where: { id: pageId },
    select: { html: true, status: true, title: true, meta: true },
  });

  if (!page || !page.html) return null;

  const meta = (page.meta as Record<string, unknown>) || {};

  let html = page.html;

  // Ensure viewport meta
  if (!/<meta[^>]*viewport/i.test(html)) {
    html = html.replace(
      /<\/head>/i,
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n</head>'
    );
  }

  // Ensure title is set
  if (page.title && /<title>\s*<\/title>/i.test(html)) {
    html = html.replace(/<title>\s*<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
  }

  // Add theme-color if in meta
  if (meta.themeColor) {
    if (!/<meta[^>]*theme-color/i.test(html)) {
      html = html.replace(
        /<\/head>/i,
        `  <meta name="theme-color" content="${escapeHtml(String(meta.themeColor))}">\n</head>`
      );
    }
  }

  return html;
}

export async function renderPublishedPage(subdomain: string): Promise<{ html: string; pageId: string } | null> {
  const page = await db.page.findFirst({
    where: {
      subdomain,
      status: "published",
    },
    select: { id: true, html: true, userId: true, title: true, meta: true },
  });

  if (!page || !page.html) return null;

  const user = await db.user.findUnique({
    where: { id: page.userId },
    select: { badgeEnabled: true },
  });

  let html = page.html;

  // Ensure viewport meta
  if (!/<meta[^>]*viewport/i.test(html)) {
    html = html.replace(
      /<\/head>/i,
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n</head>'
    );
  }

  // Add theme-color
  const meta = (page.meta as Record<string, unknown>) || {};
  if (meta.themeColor && !/<meta[^>]*theme-color/i.test(html)) {
    html = html.replace(
      /<\/head>/i,
      `  <meta name="theme-color" content="${escapeHtml(String(meta.themeColor))}">\n</head>`
    );
  }

  // Add badge
  if (user?.badgeEnabled !== false) {
    const badge = `\n<div style="position:fixed;bottom:12px;right:12px;z-index:9999;"><a href="/" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(10,11,15,0.85);color:#8A90A0;font-family:system-ui,sans-serif;font-size:11px;border-radius:6px;text-decoration:none;backdrop-filter:blur(8px);">Made with Goon</a></div>`;
    html = html.replace("</body>", `${badge}\n</body>`);
  }

  // Add goon-id meta
  html = html.replace("</head>", `  <meta name="goon-id" content="${page.id}">\n</head>`);

  return { html, pageId: page.id };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
