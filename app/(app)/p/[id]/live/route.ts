import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const page = await db.page.findUnique({
    where: { id },
    select: {
      html: true,
      status: true,
      userId: true,
    },
  });

  if (!page || !page.html || page.status !== "published") {
    return new Response("Page not found", { status: 404 });
  }

  const user = await db.user.findUnique({
    where: { id: page.userId },
    select: { badgeEnabled: true },
  });

  let html = page.html;

  // Add "Made with Goon" badge if enabled
  if (user?.badgeEnabled !== false) {
    const badge = `
<div style="position:fixed;bottom:12px;right:12px;z-index:9999;">
  <a href="/" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(10,11,15,0.85);color:#8A90A0;font-family:system-ui,sans-serif;font-size:11px;border-radius:6px;text-decoration:none;backdrop-filter:blur(8px);">
    Made with Goon
  </a>
</div>`;
    html = html.replace("</body>", `${badge}\n</body>`);
  }

  // Add goon-id meta
  html = html.replace(
    "</head>",
    `<meta name="goon-id" content="${id}">\n</head>`
  );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
