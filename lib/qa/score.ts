import type { QACategory } from "./types";
import { CATEGORY_WEIGHTS, type CategoryId } from "./types";

export function computeScore(categories: QACategory[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const category of categories) {
    const weight = CATEGORY_WEIGHTS[category.id as CategoryId] ?? 10;
    weightedSum += category.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}
