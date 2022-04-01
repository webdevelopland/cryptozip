export function compareBinary(uintA: Uint8Array, uintB: Uint8Array): boolean {
  if (!uintA && !uintB) {
    return true;
  }
  if (
    ((!uintA || !uintA.length) && (uintB && uintB.length)) ||
    ((uintA && uintA.length) && (!uintB || !uintB.length))
  ) {
    return false;
  }
  if (uintA && uintA.length > 0) {
    if (uintA.length !== uintB.length) {
      return false;
    }
    let isSame: boolean = true;
    uintA.forEach((byteA, index) => {
      const byteB = uintB[index];
      if (byteA !== byteB) {
        isSame = false;
      }
    });
    return isSame;
  }
  return true;
}
