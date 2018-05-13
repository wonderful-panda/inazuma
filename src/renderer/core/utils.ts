export function getFileName(fullpath: string): string {
  return fullpath.split("/").pop()!;
}

export function getExtension(pathOrFileName: string): string {
  const fileName = getFileName(pathOrFileName);
  const p = fileName.lastIndexOf(".");
  return 0 <= p ? fileName.slice(p) : "";
}

export function px(value: number) {
  return `${value}px`;
}

export function clamp(value: number, min: number, max: number) {
  if (value < min) {
    return min;
  } else if (max < value) {
    return max;
  } else {
    return value;
  }
}

export function normalizePathSeparator(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/$/, "");
}

export function asTuple<T1, T2>(v1: T1, v2: T2): [T1, T2];
export function asTuple<T1, T2, T3>(v1: T1, v2: T2, v3: T3): [T1, T2, T3];
export function asTuple<T1, T2, T3, T4>(v1: T1, v2: T2, v3: T3, v4: T4): [T1, T2, T3, T4];
export function asTuple(...values: any[]) {
  return values;
}
