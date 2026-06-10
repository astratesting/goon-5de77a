import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isValidSlug, isReservedSlug } from "@/lib/pages/slug";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await db.page.findUnique({ where: { id } });
  if (!page || page.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!page.html) {
    return NextResponse.json(
      { error: "Page has no content to publish." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { slug } = body;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }

  const normalizedSlug = slug.toLowerCase().trim();

  if (!isValidSlug(normalizedSlug)) {
    return NextResponse.json(
      {
        error:
          "Invalid slug. Use lowercase letters, numbers, and hyphens (2-40 chars).",
      },
      { status: 400 }
    );
  }

  if (isReservedSlug(normalizedSlug)) {
    return NextResponse.json(
      { error: "This slug is reserved." },
      { status: 409 }
    );
  }

  // Check if slug is taken by another page
  const existing = await db.page.findFirst({
    where: {
      subdomain: normalizedSlug,
      status: "published",
      NOT: { id },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This slug is already taken." },
      { status: 409 }
    );
  }

  // Publish
  const updated = await db.page.update({
    where: { id },
    data: {
      status: "published",
      subdomain: normalizedSlug,
      publishedAt: new Date(),
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://goon.so";
  const url = `${baseUrl.replace(/\/$/, "")}/p/${id}/live`;

  return NextResponse.json({
    url,
    slug: updated.subdomain,
    publicUrl: `https://${normalizedSlug}.goon.so`,
  });
}
