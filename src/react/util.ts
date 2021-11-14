import { DebouncedFunc, throttle } from "lodash";

export const assertNever = (_: never): never => {
  throw new Error("This function must be unreachable");
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const shortHash = (value: string) => value.slice(0, 8);

export const getFileName = (fullpath: string): string => {
  const p = fullpath.lastIndexOf("/");
  return 0 <= p ? fullpath.slice(p + 1) : fullpath;
};

export const getExtension = (pathOrFileName: string): string => {
  const fileName = getFileName(pathOrFileName);
  const p = fileName.lastIndexOf(".");
  return 0 <= p ? fileName.slice(p) : "";
};

export const serializeError = (error: any): ErrorLike => ({
  name: error.name || "Unknown",
  message: error.message || `${error}`,
  stack: error.stack
});

export const toSlashedPath = (path: string) => path.replace(/\\/g, "/");

type Debounced<T extends Record<string, (...args: any[]) => any>> = {
  [K in keyof T]: DebouncedFunc<T[K]>;
};
export const throttled = <T extends Record<string, (...args: any[]) => any>>(
  obj: T,
  ms: number
): Debounced<T> => {
  const ret = {} as Debounced<T>;
  Object.getOwnPropertyNames(obj).forEach((name: keyof T) => {
    ret[name] = throttle(obj[name], ms);
  });
  return ret;
};
