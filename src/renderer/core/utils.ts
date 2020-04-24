import moment from "moment";
import { SetupContext } from "@vue/composition-api";
import { VNode } from "vue/types/umd";

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

export function evaluateSlot<
  CTX extends SetupContext,
  K extends keyof CTX["slots"]
>(
  ctx: CTX,
  slotName: K,
  ...args: Parameters<CTX["slots"][K]>
): VNode | VNode[] | undefined {
  const slot = ctx.slots[slotName as string];
  if (!slot) {
    return undefined;
  } else {
    return slot(...args);
  }
}

// This method is originated in vuejs/vue. https://github.com/vuejs/vue
export function toNumber(val: any): string | number {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
}

export function omit<B, K extends string[]>(
  obj: B,
  keys: K
): Omit<B, K & keyof B> {
  const ret = { ...obj } as any;
  for (const key of keys) {
    if (key in ret) {
      delete ret[key];
    }
  }
  return ret;
}
