import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generatePage } from "@/lib/ai/generate-page";

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

  // Trigger generation
  const result = await generatePage(page.id, page.prompt);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Generation failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    title: result.title,
    sections: result.sections,
    html: result.html,
    qaReport: result.qaReport,
  });
}
