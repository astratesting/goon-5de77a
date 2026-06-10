import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { renderPublishedPage } from "@/lib/publish/render";

export default async function PublishedPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;

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
