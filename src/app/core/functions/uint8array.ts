export function mergeUint8Arrays(...args): Uint8Array {
  let size: number = 0;
  for (const binary of args) {
    size += binary.length;
  }
  const uint8Array = new Uint8Array(size);
  size = 0;
  for (const binary of args) {
    uint8Array.set(binary, size);
    size += binary.length;
  }
  return uint8Array;
}
