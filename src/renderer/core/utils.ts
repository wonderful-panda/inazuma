import { SetupContext, reactive, watch } from "@vue/composition-api";
import moment from "moment";

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

export function formatDateL(v: number): string {
  return moment(v)
    .local()
    .format("L");
}

export function useStorage<T extends object>(
  initialValue: T,
  storageKey: string | undefined
) {
  if (!storageKey) {
    return reactive(initialValue);
  }
  const storedString = localStorage.getItem(storageKey);
  let value: T;
  if (storedString) {
    try {
      value = { ...initialValue, ...JSON.parse(storedString) } as T;
    } catch (e) {
      console.warn("Failed to parse string from localStorage: " + storageKey);
      value = initialValue;
    }
  } else {
    value = initialValue;
  }
  const ret = reactive(value);
  watch(
    () => ret,
    value => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    },
    { deep: true, lazy: true }
  );
  return ret;
}

export function asTuple<T1, T2>(v1: T1, v2: T2): [T1, T2];
export function asTuple<T1, T2, T3>(v1: T1, v2: T2, v3: T3): [T1, T2, T3];
export function asTuple<T1, T2, T3, T4>(
  v1: T1,
  v2: T2,
  v3: T3,
  v4: T4
): [T1, T2, T3, T4];
export function asTuple(...values: any[]) {
  return values;
}

export function updateEmitter<Props>() {
  return <K extends keyof Props & string>(
    ctx: SetupContext,
    name: K,
    value: Props[K]
  ) => {
    ctx.emit("update:" + name, value);
  };
}
