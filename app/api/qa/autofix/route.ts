import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { applyAutoFix } from "@/lib/qa/autofix";
import { runFullQA } from "@/lib/qa/scan";
import type { QAIssue } from "@/lib/qa/types";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { pageId, issueId } = body;

  if (!pageId || !issueId) {
    return NextResponse.json({ error: "pageId and issueId required" }, { status: 400 });
  }

  const page = await db.page.findUnique({ where: { id: pageId } });
  if (!page || page.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!page.html) {
    return NextResponse.json({ error: "Page has no HTML" }, { status: 400 });
  }

  // Find the issue in the current QA report
  const report = page.qaReportJson as Record<string, unknown> | null;
  const categories = (report?.categories as Array<{ id: string; issues: QAIssue[] }>) || [];
  let targetIssue: QAIssue | null = null;

  for (const cat of categories) {
    const found = cat.issues.find((i) => i.id === issueId);
    if (found) {
      targetIssue = found;
      break;
    }
  }

  if (!targetIssue || !targetIssue.autoFix) {
    return NextResponse.json({ error: "Issue not found or not auto-fixable" }, { status: 400 });
  }

  // Apply the fix
  const fixedHtml = applyAutoFix(page.html, targetIssue);

  // Update page
  const newVersion = page.version + 1;
  await db.page.update({
    where: { id: pageId },
    data: {
      html: fixedHtml,
      version: newVersion,
    },
  });

  // Re-scan
  const result = await runFullQA(pageId, fixedHtml, page.prompt);

  await db.qAResult.create({
    data: {
      pageId,
      version: newVersion,
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

  return NextResponse.json({
    result,
    previousScore: report?.overall ?? page.qaScore,
    newScore: result.overall,
  });
}
