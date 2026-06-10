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
      qaScore: true,
      updatedAt: true,
      subdomain: true,
    },
  });

  const serialized = pages.map((p) => ({
    ...p,
    updatedAt: p.updatedAt.toISOString(),
    qaScore: p.qaScore ?? null,
    subdomain: p.subdomain ?? null,
  }));

  return <DashboardClient pages={serialized} />;
}
