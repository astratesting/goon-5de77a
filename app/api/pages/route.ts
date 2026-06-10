import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await db.page.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      qaScore: true,
      updatedAt: true,
      subdomain: true,
    },
  });

  return NextResponse.json(
    pages.map((p) => ({
      ...p,
      updatedAt: p.updatedAt.toISOString(),
    }))
  );
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { prompt } = body;

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const trimmed = prompt.trim();
  if (trimmed.length < 1 || trimmed.length > 2000) {
    return NextResponse.json(
      { error: "Prompt must be 1-2000 characters." },
      { status: 400 }
    );
  }

  // Soft cap: 5 pages on free tier
  const pageCount = await db.page.count({
    where: { userId: session.user.id },
  });

  if (pageCount >= 5) {
    return NextResponse.json(
      {
        error:
          "Free tier: 5 pages. Upgrade coming soon.",
      },
      { status: 403 }
    );
  }

  const page = await db.page.create({
    data: {
      userId: session.user.id,
      prompt: trimmed,
      status: "generating",
    },
  });

  return NextResponse.json({ id: page.id });
}
