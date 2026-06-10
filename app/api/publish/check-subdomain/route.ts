import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSubdomain, generateSuggestions } from "@/lib/publish/subdomain";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ valid: false, error: "Subdomain is required." });
  }

  const validation = validateSubdomain(slug);
  if (!validation.valid) {
    return NextResponse.json({
      valid: false,
      available: false,
      error: validation.error,
      suggestions: validation.suggestions,
    });
  }

  const normalized = slug.toLowerCase().trim();

  const existing = await db.page.findFirst({
    where: {
      subdomain: normalized,
      status: "published",
    },
  });

  if (existing) {
    return NextResponse.json({
      valid: true,
      available: false,
      slug: normalized,
      suggestions: generateSuggestions(normalized),
    });
  }

  return NextResponse.json({
    valid: true,
    available: true,
    slug: normalized,
  });
}
