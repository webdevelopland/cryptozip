export function addZero(num: number): string {
  num = Math.floor(num);
  return ('0' + num).slice(-2);
}
