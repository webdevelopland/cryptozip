export function isApple(): boolean {
  const toMatch = [
    /iPhone/i,
    /iPad/i,
    /iPod/i,
  ];
  return toMatch.some(toMatchItem => {
    return navigator.userAgent.match(toMatchItem);
  });
}
