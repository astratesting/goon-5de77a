// AI utility wrapper — calls the configured AI provider
// For v1, uses a simple HTTP call to the configured endpoint or returns mock data

export interface AISection {
  id: string;
  type: "hero" | "features" | "pricing" | "testimonials" | "cta" | "footer" | "custom";
  content: Record<string, string>;
}

export interface AIGenerateResult {
  title: string;
  sections: AISection[];
}

function getAIApiKey(): string {
  return process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
}

export async function callAI(prompt: string): Promise<AIGenerateResult> {
  const apiKey = getAIApiKey();

  if (!apiKey) {
    return generateMockResponse(prompt);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a landing page generator. Given a prompt, output a JSON object with:
- "title": a short title for the page
- "sections": an array of section objects, each with:
  - "id": a unique string
  - "type": one of "hero", "features", "pricing", "testimonials", "cta", "footer", "custom"
  - "content": an object with relevant text fields for that section type

For hero: headline, subheadline, cta
For features: headline, feature1, feature2, feature3
For pricing: headline, price, period, description, cta
For testimonials: headline, quote1, quote2, quote3
For cta: headline, subheadline, cta
For footer: text

Output ONLY valid JSON, no markdown fences. Keep copy concise and professional.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return generateMockResponse(prompt);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return generateMockResponse(prompt);
    }

    const parsed = JSON.parse(content);
    return {
      title: parsed.title || "Generated Page",
      sections: parsed.sections || [],
    };
  } catch (err) {
    console.error("AI call failed:", err);
    return generateMockResponse(prompt);
  }
}

export async function callAIForSection(
  prompt: string,
  sectionType: string,
  existingContext: string,
  instruction: string
): Promise<AISection> {
  const apiKey = getAIApiKey();

  if (!apiKey) {
    return generateMockSection(sectionType, instruction);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You regenerate a single landing page section. Given the original prompt, existing page context, and a user instruction, output a JSON object for just one section:
- "id": a unique string
- "type": "${sectionType}"
- "content": object with relevant text fields

Output ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Original prompt: ${prompt}\n\nExisting page: ${existingContext}\n\nInstruction: ${instruction}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      return generateMockSection(sectionType, instruction);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return generateMockSection(sectionType, instruction);
    }

    return JSON.parse(content);
  } catch {
    return generateMockSection(sectionType, instruction);
  }
}

function generateMockResponse(prompt: string): AIGenerateResult {
  const title = prompt.length > 40 ? prompt.slice(0, 40) + "…" : prompt;
  return {
    title,
    sections: [
      {
        id: crypto.randomUUID(),
        type: "hero",
        content: {
          headline: title,
          subheadline: "Everything you need to get started, in one place.",
          cta: "Get Started",
        },
      },
      {
        id: crypto.randomUUID(),
        type: "features",
        content: {
          headline: "Why choose us",
          feature1: "Simple and intuitive design that anyone can use.",
          feature2: "Fast setup — be live in under 5 minutes.",
          feature3: "Built for the modern web, works everywhere.",
        },
      },
      {
        id: crypto.randomUUID(),
        type: "cta",
        content: {
          headline: "Ready to get started?",
          subheadline: "Join today and see the difference.",
          cta: "Sign Up Now",
        },
      },
      {
        id: crypto.randomUUID(),
        type: "footer",
        content: { text: "© 2025. All rights reserved." },
      },
    ],
  };
}

function generateMockSection(type: string, instruction: string): AISection {
  const content: Record<string, string> = {};
  switch (type) {
    case "hero":
      content.headline = "Updated Section";
      content.subheadline = instruction || "Fresh content for your page.";
      content.cta = "Get Started";
      break;
    case "features":
      content.headline = "Key Features";
      content.feature1 = "Enhanced capability based on your feedback.";
      content.feature2 = "Streamlined for better performance.";
      content.feature3 = "Designed with your audience in mind.";
      break;
    case "cta":
      content.headline = "Take the Next Step";
      content.subheadline = "Your audience is waiting.";
      content.cta = "Get Started";
      break;
    default:
      content.headline = "Updated Content";
      content.body = instruction || "Content updated.";
  }
  return { id: crypto.randomUUID(), type: type as AISection["type"], content };
}
