import { reservedSlugs } from "@/lib/subdomains/reserved";

const SUBDOMAIN_MIN = 3;
const SUBDOMAIN_MAX = 32;
const VALID_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export interface SubdomainValidation {
  valid: boolean;
  error?: string;
  suggestions?: string[];
}

export function validateSubdomain(input: string): SubdomainValidation {
  const slug = input.toLowerCase().trim();

  if (!slug) {
    return { valid: false, error: "Subdomain is required." };
  }

  if (slug.length < SUBDOMAIN_MIN) {
    return { valid: false, error: `Must be at least ${SUBDOMAIN_MIN} characters.` };
  }

  if (slug.length > SUBDOMAIN_MAX) {
    return { valid: false, error: `Must be ${SUBDOMAIN_MAX} characters or fewer.` };
  }

  if (!VALID_PATTERN.test(slug)) {
    return { valid: false, error: "Only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen." };
  }

  if (slug.includes("www")) {
    return { valid: false, error: 'Cannot contain "www".' };
  }

  if (reservedSlugs.includes(slug)) {
    return { valid: false, error: "This subdomain is reserved.", suggestions: generateSuggestions(slug) };
  }

  return { valid: true };
}

export function generateSuggestions(slug: string): string[] {
  const suggestions: string[] = [];
  const base = slug.replace(/-$/, "");

  suggestions.push(`${base}2`);
  suggestions.push(`${base}hq`);
  suggestions.push(`get${base}`);

  return suggestions.slice(0, 3);
}

export function isReservedSubdomain(slug: string): boolean {
  return reservedSlugs.includes(slug.toLowerCase().trim());
}
