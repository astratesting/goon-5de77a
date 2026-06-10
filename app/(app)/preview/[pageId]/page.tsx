import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { renderPageForPreview } from "@/lib/publish/render";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/signin?returnTo=/preview/${pageId}`);
  }

  const page = await db.page.findUnique({
    where: { id: pageId },
    select: { userId: true },
  });

  if (!page || page.userId !== session.user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Page not found or access denied.</p>
      </div>
    );
  }

  const html = await renderPageForPreview(pageId);
  if (!html) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Page not found.</p>
      </div>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="min-h-screen bg-white"
    />
  );
}
