export function round(n: number, e: number): number {
  const p: number = Math.pow(10, e);
  return Math.round(n * p) / p;
}
