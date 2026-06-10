import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await db.page.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      status: true,
      qaScore: true,
      qaReportJson: true,
      subdomain: true,
      updatedAt: true,
      html: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const result = pages.map((page) => {
    const report = page.qaReportJson as Record<string, unknown> | null;
    const categories = (report?.categories as Array<{ id: string; score: number; issues: unknown[] }>) || [];
    const mobileCategory = categories.find((c) => c.id === "mobile");
    const mobileIssues = mobileCategory?.issues?.length ?? 0;
    const totalIssues = categories.reduce((sum, c) => sum + (c.issues?.length ?? 0), 0);
    const failCount = categories.reduce(
      (sum, c) => sum + ((c.issues as Array<{ severity: string }>)?.filter((i) => i.severity === "fail").length ?? 0),
      0
    );

    return {
      id: page.id,
      title: page.title,
      status: page.status,
      score: page.qaScore,
      band: page.qaScore !== null ? (page.qaScore >= 90 ? "good" : page.qaScore >= 70 ? "fair" : "poor") : null,
      subdomain: page.subdomain,
      updatedAt: page.updatedAt.toISOString(),
      mobileIssues,
      totalIssues,
      failCount,
      hasHtml: !!page.html,
      categories,
    };
  });

  return NextResponse.json(result);
}
