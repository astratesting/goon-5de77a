import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidSlug, isReservedSlug } from "@/lib/pages/slug";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ available: false, error: "Slug is required." });
  }

  const normalized = slug.toLowerCase().trim();

  if (!isValidSlug(normalized)) {
    return NextResponse.json({ available: false, error: "Invalid slug format." });
  }

  if (isReservedSlug(normalized)) {
    return NextResponse.json({ available: false, error: "Reserved slug." });
  }

  const existing = await db.page.findFirst({
    where: {
      subdomain: normalized,
      status: "published",
    },
  });

  return NextResponse.json({
    available: !existing,
    slug: normalized,
  });
}
