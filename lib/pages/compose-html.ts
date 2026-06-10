import type { Section } from "./sections";

const sectionTemplates: Record<string, (content: Record<string, string>) => string> = {
  hero: (c) => `
    <section class="hero" data-section-type="hero">
      <div class="container">
        <h1>${esc(c.headline || "Welcome")}</h1>
        ${c.subheadline ? `<p class="subheadline">${esc(c.subheadline)}</p>` : ""}
        ${c.cta ? `<a href="#signup" class="btn btn-primary">${esc(c.cta)}</a>` : ""}
      </div>
    </section>`,

  features: (c) => {
    const items = Object.entries(c)
      .filter(([k]) => k.startsWith("feature"))
      .map(([, v]) => `<div class="feature-item"><p>${esc(v)}</p></div>`)
      .join("\n");
    return `
    <section class="features" data-section-type="features">
      <div class="container">
        ${c.headline ? `<h2>${esc(c.headline)}</h2>` : ""}
        <div class="features-grid">${items || "<p>Features coming soon</p>"}</div>
      </div>
    </section>`;
  },

  pricing: (c) => `
    <section class="pricing" data-section-type="pricing">
      <div class="container">
        ${c.headline ? `<h2>${esc(c.headline)}</h2>` : ""}
        ${c.price ? `<div class="price-display"><span class="price">${esc(c.price)}</span>${c.period ? `<span class="period">${esc(c.period)}</span>` : ""}</div>` : ""}
        ${c.description ? `<p>${esc(c.description)}</p>` : ""}
        ${c.cta ? `<a href="#signup" class="btn btn-primary">${esc(c.cta)}</a>` : ""}
      </div>
    </section>`,

  testimonials: (c) => {
    const quotes = Object.entries(c)
      .filter(([k]) => k.startsWith("quote"))
      .map(([, v]) => `<blockquote class="testimonial-quote">${esc(v)}</blockquote>`)
      .join("\n");
    return `
    <section class="testimonials" data-section-type="testimonials">
      <div class="container">
        ${c.headline ? `<h2>${esc(c.headline)}</h2>` : ""}
        <div class="testimonials-grid">${quotes || "<p>Testimonials coming soon</p>"}</div>
      </div>
    </section>`;
  },

  cta: (c) => `
    <section class="cta-section" data-section-type="cta">
      <div class="container">
        <h2>${esc(c.headline || "Ready to get started?")}</h2>
        ${c.subheadline ? `<p>${esc(c.subheadline)}</p>` : ""}
        <a href="#signup" class="btn btn-primary">${esc(c.cta || "Get Started")}</a>
      </div>
    </section>`,

  footer: (c) => `
    <footer data-section-type="footer">
      <div class="container">
        <p>${esc(c.text || "All rights reserved.")}</p>
      </div>
    </footer>`,

  custom: (c) => `
    <section data-section-type="custom">
      <div class="container">
        ${c.headline ? `<h2>${esc(c.headline)}</h2>` : ""}
        ${c.body ? `<div>${c.body}</div>` : ""}
      </div>
    </section>`,
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function composeHtml(sections: Section[]): string {
  const sectionHtml = sections
    .map((s) => {
      const template = sectionTemplates[s.type] || sectionTemplates.custom;
      return template(s.content || {});
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a2e; background: #ffffff; }
    .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
    h1 { font-size: 2.5rem; font-weight: 700; line-height: 1.1; margin-bottom: 1rem; }
    h2 { font-size: 1.75rem; font-weight: 600; margin-bottom: 1rem; }
    p { margin-bottom: 1rem; color: #4a4a6a; }
    .subheadline { font-size: 1.125rem; max-width: 600px; }
    .hero { padding: 96px 0; text-align: center; }
    .features { padding: 80px 0; background: #f8f9fc; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 32px; }
    .feature-item { padding: 24px; background: #fff; border-radius: 12px; border: 1px solid #e8eaf0; }
    .pricing { padding: 80px 0; text-align: center; }
    .price-display { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    .period { font-size: 1rem; color: #888; }
    .testimonials { padding: 80px 0; background: #f8f9fc; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 32px; }
    .testimonial-quote { padding: 24px; background: #fff; border-radius: 12px; border: 1px solid #e8eaf0; font-style: italic; }
    .cta-section { padding: 80px 0; text-align: center; background: #1a1a2e; color: #fff; }
    .cta-section p { color: #b0b0d0; }
    footer { padding: 40px 0; text-align: center; border-top: 1px solid #e8eaf0; font-size: 0.875rem; }
    .btn { display: inline-block; padding: 12px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 150ms; }
    .btn-primary { background: #5B5BFF; color: #fff; }
    .btn-primary:hover { background: #4a4aee; transform: translateY(-1px); }
    @media (max-width: 768px) {
      h1 { font-size: 1.875rem; }
      h2 { font-size: 1.5rem; }
      .hero { padding: 64px 0; }
      .features, .pricing, .testimonials, .cta-section { padding: 48px 0; }
    }
  </style>
</head>
<body>
${sectionHtml}
</body>
</html>`;
}
