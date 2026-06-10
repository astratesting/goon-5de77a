import type { QACheck } from "./checks/layout";
import type { MobileCheck } from "./checks/mobile";

export interface QAReport {
  score: number;
  checks: Array<QACheck | MobileCheck>;
  ranAt: string;
  breakdown: {
    layoutScore: number;
    mobileScore: number;
  };
}

function checksToScore(checks: Array<QACheck | MobileCheck>): number {
  let score = 100;
  for (const check of checks) {
    if (check.status === "fail") score -= 15;
    else if (check.status === "warn") score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

export function computeFinalScore(
  layoutChecks: QACheck[],
  mobileChecks: MobileCheck[]
): QAReport {
  const layoutScore = checksToScore(layoutChecks);
  const mobileScore = checksToScore(mobileChecks);

  const combined = Math.round(0.4 * layoutScore + 0.6 * mobileScore);

  return {
    score: combined,
    checks: [...layoutChecks, ...mobileChecks],
    ranAt: new Date().toISOString(),
    breakdown: { layoutScore, mobileScore },
  };
}
