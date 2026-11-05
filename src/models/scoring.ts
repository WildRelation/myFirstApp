export function calculateScore(
  hits: number,
  falseAlarms: number
): number {
  return Math.max(0, hits - falseAlarms);
}