/**
 * Miscellaneous array utilities.
 */

export function clear<T>(arr: T[][]) {
  for (const a of arr) {
    a.length = 0;
  }
}

export function copy<T>(arr: Readonly<Readonly<T[]>[]>) {
  const buf: T[][] = [];
  for (const a of arr) {
    buf.push([...a]);
  }
  return buf;
}

export function endsWith<T>(buffer: Readonly<T[]>, values: Readonly<T[]>): boolean {
  const vl = values.length;
  const dl = buffer.length - vl;
  if (dl < 0) {
    return false;
  }

  for (let i = vl; i-- > 0;) {
    if (buffer[i + dl] !== values[i]) {
      return false;
    }
  }

  return true;
}
