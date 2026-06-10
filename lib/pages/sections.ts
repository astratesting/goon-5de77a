export type SectionType =
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "cta"
  | "footer"
  | "custom";

export interface Section {
  id: string;
  type: SectionType;
  content: Record<string, string>;
}

export function defaultSections(): Section[] {
  return [
    {
      id: crypto.randomUUID(),
      type: "hero",
      content: {
        headline: "Welcome",
        subheadline: "Your page is being generated",
        cta: "Get Started",
      },
    },
  ];
}

export function sectionLabel(type: SectionType): string {
  const labels: Record<SectionType, string> = {
    hero: "Hero",
    features: "Features",
    pricing: "Pricing",
    testimonials: "Testimonials",
    cta: "Call to Action",
    footer: "Footer",
    custom: "Section",
  };
  return labels[type] ?? "Section";
}
