import { type DebouncedFunc, throttle } from "lodash";

export const assertNever = (_: never): never => {
  throw new Error("This function must be unreachable");
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const shortHash = (value: string) => value.slice(0, 7);

export const getFileName = (fullpath: string): string => {
  const p = fullpath.lastIndexOf("/");
  return 0 <= p ? fullpath.slice(p + 1) : fullpath;
};

export const getExtension = (pathOrFileName: string): string => {
  const fileName = getFileName(pathOrFileName);
  const p = fileName.lastIndexOf(".");
  return 0 <= p ? fileName.slice(p) : "";
};

export const serializeError = (error: unknown): ErrorLike => {
  if (typeof error === "object" && error !== null) {
    return {
      name: "name" in error ? (error.name as string) : "Unknown",
      message: "message" in error ? (error.message as string) : JSON.stringify(error),
      stack: "stack" in error ? (error.stack as string) : undefined
    };
  } else if (typeof error === "string") {
    return {
      message: error,
      stack: undefined
    };
  } else {
    return {
      name: "Unknown",
      message: JSON.stringify(error),
      stack: undefined
    };
  }
};

export const toSlashedPath = (path: string) => path.replace(/\\/g, "/");

type Debounced<T extends Record<string, (...args: never[]) => unknown>> = {
  [K in keyof T]: DebouncedFunc<T[K]>;
};
export const throttled = <T extends Record<string, (...args: never[]) => unknown>>(
  obj: T,
  ms: number
): Debounced<T> => {
  const ret = {} as Debounced<T>;
  Object.getOwnPropertyNames(obj).forEach((name: keyof T) => {
    ret[name] = throttle(obj[name], ms);
  });
  return ret;
};

export const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const nope = () => {
  /* do nothing */
};
