import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { runFullQA } from "@/lib/qa/scan";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { pageId, all: scanAll } = body;

  if (scanAll) {
    const pages = await db.page.findMany({
      where: { userId: session.user.id, html: { not: null } },
      select: { id: true, html: true, prompt: true, version: true },
    });

    const results = [];
    for (const page of pages) {
      if (!page.html) continue;
      const result = await runFullQA(page.id, page.html, page.prompt);
      await db.qAResult.create({
        data: {
          pageId: page.id,
          version: page.version,
          overall: result.overall,
          band: result.band,
          categories: JSON.parse(JSON.stringify(result.categories)),
          suggestions: JSON.parse(JSON.stringify(result.suggestions)),
        },
      });
      await db.page.update({
        where: { id: page.id },
        data: {
          qaScore: result.overall,
          qaReportJson: JSON.parse(JSON.stringify(result)),
        },
      });
      results.push({ pageId: page.id, score: result.overall });
    }

    return NextResponse.json({ results });
  }

  if (!pageId) {
    return NextResponse.json({ error: "pageId required" }, { status: 400 });
  }

  const page = await db.page.findUnique({ where: { id: pageId } });
  if (!page || page.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!page.html) {
    return NextResponse.json({ error: "Page has no HTML" }, { status: 400 });
  }

  const result = await runFullQA(pageId, page.html, page.prompt);

  await db.qAResult.create({
    data: {
      pageId,
      version: page.version,
      overall: result.overall,
      band: result.band,
      categories: JSON.parse(JSON.stringify(result.categories)),
      suggestions: JSON.parse(JSON.stringify(result.suggestions)),
    },
  });

  await db.page.update({
    where: { id: pageId },
    data: {
      qaScore: result.overall,
      qaReportJson: JSON.parse(JSON.stringify(result)),
    },
  });

  return NextResponse.json(result);
}
