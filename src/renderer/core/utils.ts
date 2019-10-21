import { SetupContext } from "@vue/composition-api";
import moment from "moment";
import { RenderContext } from "vue";

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

export function withPseudoSetter<Props, K extends keyof Props>(
  props: Props,
  name: K,
  listeners: RenderContext["listeners"]
) {
  const handler = listeners["update:" + name];
  return {
    value: props[name],
    setValue: (v: Props[K]) => {
      if (handler) {
        if (handler instanceof Array) {
          handler.forEach(h => h(v));
        } else {
          handler(v);
        }
      }
    }
  };
}
