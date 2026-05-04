import { LABELS, type Letter } from "@/lib/ml/labels";

export function buildAlphabetical(): Letter[] {
  return [...LABELS];
}

export function buildRandom(count: number): Letter[] {
  const clamped = Math.min(50, Math.max(1, count));
  const shuffled = [...LABELS].sort(() => Math.random() - 0.5);
  // If count > 26, allow repeats by filling up
  if (clamped <= 26) return shuffled.slice(0, clamped);

  const result: Letter[] = [...shuffled];
  while (result.length < clamped) {
    const extra = [...LABELS].sort(() => Math.random() - 0.5);
    result.push(...extra);
  }
  return result.slice(0, clamped);
}
