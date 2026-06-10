import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { validateSubdomain } from "@/lib/publish/subdomain";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { pageId, subdomain, isCustom } = body;

  if (!pageId || !subdomain) {
    return NextResponse.json({ error: "pageId and subdomain required" }, { status: 400 });
  }

  const page = await db.page.findUnique({ where: { id: pageId } });
  if (!page || page.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!page.html) {
    return NextResponse.json({ error: "Page has no content to publish" }, { status: 400 });
  }

  // Validate subdomain
  const validation = validateSubdomain(subdomain);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const normalized = subdomain.toLowerCase().trim();

  // Check uniqueness
  const existing = await db.page.findFirst({
    where: {
      subdomain: normalized,
      status: "published",
      NOT: { id: pageId },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "This subdomain is already taken." }, { status: 409 });
  }

  // Publish the page
  const updated = await db.page.update({
    where: { id: pageId },
    data: {
      status: "published",
      subdomain: normalized,
      publishedAt: new Date(),
    },
  });

  // Create or update subdomain record
  await db.subdomain.upsert({
    where: { pageId },
    create: {
      pageId,
      host: normalized,
      isCustom: isCustom ?? false,
      verified: !isCustom,
    },
    update: {
      host: normalized,
      isCustom: isCustom ?? false,
      verified: !isCustom,
    },
  });

  // Create publish record
  await db.publishRecord.create({
    data: {
      pageId,
      publishedVersion: page.version,
    },
  });

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://goon.app"}/p/${normalized}`;

  return NextResponse.json({
    url: publicUrl,
    slug: normalized,
    publicUrl,
  });
}
