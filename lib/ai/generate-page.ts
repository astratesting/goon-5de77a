import { callAI } from "@/lib/ai";
import { composeHtml } from "@/lib/pages/compose-html";
import { runQA } from "@/lib/qa/runner";
import { db } from "@/lib/db";

export async function generatePage(pageId: string, prompt: string) {
  try {
    const result = await callAI(prompt);

    const html = composeHtml(result.sections);

    const qaReport = await runQA(html, prompt);

    await db.page.update({
      where: { id: pageId },
      data: {
        title: result.title,
        html,
        sectionsJson: JSON.parse(JSON.stringify(result.sections)),
        qaScore: qaReport.score,
        qaReportJson: JSON.parse(JSON.stringify(qaReport)),
        status: "draft",
      },
    });

    return { success: true, title: result.title, sections: result.sections, html, qaReport };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    await db.page.update({
      where: { id: pageId },
      data: { status: "error", error: message },
    });
    return { success: false, error: message };
  }
}
