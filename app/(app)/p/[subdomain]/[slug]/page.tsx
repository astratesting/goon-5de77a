import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { renderPublishedPage } from "@/lib/publish/render";

export default async function PublishedSlugPage({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}) {
  const { subdomain } = await params;

  // For now, subdomain-based pages don't have slugs
  // This route exists for future custom domain slug support
  const result = await renderPublishedPage(subdomain);
  if (!result) {
    notFound();
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: result.html }}
      className="min-h-screen"
    />
  );
}
