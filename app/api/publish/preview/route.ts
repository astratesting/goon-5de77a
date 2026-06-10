import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { renderPageForPreview } from "@/lib/publish/render";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pageId = request.nextUrl.searchParams.get("pageId");
  if (!pageId) {
    return NextResponse.json({ error: "pageId required" }, { status: 400 });
  }

  const html = await renderPageForPreview(pageId);
  if (!html) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
