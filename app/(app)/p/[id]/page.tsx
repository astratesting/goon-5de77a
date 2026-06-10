import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import EditorClient from "./editor-client";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/signin?returnTo=/p/${id}`);
  }

  const page = await db.page.findUnique({
    where: { id },
  });

  if (!page || page.userId !== session.user.id) {
    notFound();
  }

  return (
    <EditorClient
      page={{
        id: page.id,
        title: page.title,
        prompt: page.prompt,
        status: page.status,
        html: page.html || "",
        sectionsJson: (page.sectionsJson as unknown as Array<{ id: string; type: string; content: Record<string, string> }>) || [],
        qaScore: page.qaScore ?? null,
        qaReportJson: (page.qaReportJson as unknown as { score: number; checks: Array<{ name: string; status: "pass" | "warn" | "fail"; value: string; detail: string; viewport?: string }>; ranAt: string }) || null,
        subdomain: page.subdomain ?? null,
      }}
    />
  );
}
