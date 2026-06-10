import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { runQA } from "@/lib/qa/runner";

export async function GET(
  _request: NextRequest,
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

  if (page.qaReportJson) {
    return NextResponse.json(page.qaReportJson);
  }

  return NextResponse.json({ score: null, checks: [], ranAt: null });
}

export async function POST(
  _request: NextRequest,
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
      { error: "Page has no HTML to score." },
      { status: 400 }
    );
  }

  const report = await runQA(page.html, page.prompt);

  await db.page.update({
    where: { id },
    data: {
      qaScore: report.score,
      qaReportJson: JSON.parse(JSON.stringify(report)),
    },
  });

  return NextResponse.json(report);
}
