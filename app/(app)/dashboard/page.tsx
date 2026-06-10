import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardClient from "./page-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const pages = await db.page.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      html: true,
      qaScore: true,
      qaReportJson: true,
      updatedAt: true,
      createdAt: true,
      subdomain: true,
    },
  });

  const serialized = pages.map((p) => ({
    ...p,
    updatedAt: p.updatedAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
    html: p.html ?? null,
    qaScore: p.qaScore ?? null,
    qaReportJson: p.qaReportJson as Record<string, unknown> | null,
    subdomain: p.subdomain ?? null,
  }));

  return <DashboardClient pages={serialized} />;
}
