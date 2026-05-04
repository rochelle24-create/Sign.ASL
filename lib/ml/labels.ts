export const LABELS = [
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T",
  "U","V","W","X","Y","Z",
] as const;

export type Letter = typeof LABELS[number];

export const MOTION_LETTERS: Letter[] = ["J", "Z"];

export function isMotionLetter(letter: Letter): boolean {
  return MOTION_LETTERS.includes(letter);
}
