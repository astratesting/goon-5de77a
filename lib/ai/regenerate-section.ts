import { callAIForSection } from "@/lib/ai";
import { composeHtml } from "@/lib/pages/compose-html";
import { runQA } from "@/lib/qa/runner";
import { db } from "@/lib/db";
import type { Section } from "@/lib/pages/sections";

export async function regenerateSection(
  pageId: string,
  sectionId: string,
  instruction: string
) {
  const page = await db.page.findUnique({ where: { id: pageId } });
  if (!page) throw new Error("Page not found");

  const sections = (page.sectionsJson as unknown as Section[]) || [];
  const sectionIndex = sections.findIndex((s) => s.id === sectionId);
  if (sectionIndex === -1) throw new Error("Section not found");

  const section = sections[sectionIndex];

  const newSection = await callAIForSection(
    page.prompt,
    section.type,
    JSON.stringify(sections),
    instruction
  );

  newSection.id = sectionId;
  sections[sectionIndex] = newSection;

  const html = composeHtml(sections);
  const qaReport = await runQA(html, page.prompt);

  await db.page.update({
    where: { id: pageId },
    data: {
      html,
      sectionsJson: JSON.parse(JSON.stringify(sections)),
      qaScore: qaReport.score,
      qaReportJson: JSON.parse(JSON.stringify(qaReport)),
    },
  });

  return { sections, html, qaReport };
}
