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
