import { runLayoutChecks } from "./checks/layout";
import { runMobileChecks } from "./checks/mobile";
import { computeFinalScore, type QAReport } from "./score";

export async function runQA(html: string, prompt: string): Promise<QAReport> {
  const layoutChecks = runLayoutChecks(html, prompt);
  const mobileChecks = runMobileChecks(html);
  return computeFinalScore(layoutChecks, mobileChecks);
}
