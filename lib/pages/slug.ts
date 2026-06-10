import { reservedSlugs } from "@/lib/subdomains/reserved";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 39);
}

export function isValidSlug(slug: string): boolean {
  const pattern = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
  return pattern.test(slug);
}

export function isReservedSlug(slug: string): boolean {
  return reservedSlugs.includes(slug);
}

export function suggestSlug(title: string): string {
  const base = slugify(title);
  if (!base) return "my-page";
  return base;
}
