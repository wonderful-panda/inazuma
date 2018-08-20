import { VueConstructor, CreateElement, VNode, RenderContext } from "vue";
import { RecordPropsDefinition, ArrayPropsDefinition } from "vue/types/options";
import { AsComponent, WithProps, OuterProps } from "vue-support";

export type ClassBinding =
  | string
  | undefined
  | Dict<boolean | undefined>
  | ReadonlyArray<string | object | undefined>;

export function withClass<C extends VueConstructor | string>(
  component: C,
  newClass: ClassBinding
): AsComponent<C>;

export function withClass<
  C extends VueConstructor | string,
  Props,
  PropsDef extends RecordPropsDefinition<Props>
>(
  component: C,
  props: PropsDef & RecordPropsDefinition<Props>,
  newClass: (props: Props) => ClassBinding
): WithProps<AsComponent<C>, OuterProps<Props, PropsDef>>;

export function withClass<
  C extends VueConstructor | string,
  Props,
  PropsDef extends ArrayPropsDefinition<Props>
>(
  component: C,
  props: PropsDef & ArrayPropsDefinition<Props>,
  newClass: (props: Props) => ClassBinding
): WithProps<AsComponent<C>, OuterProps<Props, PropsDef>>;

export function withClass(component: any, ...args: any[]): any {
  if (args.length === 1) {
    return {
      functional: true,
      render(h: CreateElement, { data, children }: RenderContext): VNode {
        data.class = mergeClassObject(data.class, args[0]);
        return h(component, data, children);
      }
    };
  } else {
    const newClass = args[1] as Function;
    return {
      functional: true,
      props: args[0],
      render(
        h: CreateElement,
        { props, data, children }: RenderContext
      ): VNode {
        data.class = mergeClassObject(data.class, newClass(props));
        return h(component, data, children);
      }
    };
  }
}

function mergeClassObject(
  base: ClassBinding | undefined,
  newClass: ClassBinding | undefined
): ClassBinding | undefined {
  if (base === undefined || newClass === undefined) {
    return base || newClass;
  }
  if (base instanceof Array) {
    if (newClass instanceof Array) {
      return [...base, ...newClass];
    } else {
      return [...base, newClass];
    }
  } else if (base instanceof String || typeof base === "string") {
    if (newClass instanceof Array) {
      return [base, ...newClass];
    } else if (newClass instanceof String) {
      return `${base} ${newClass}`;
    } else {
      return { [base as string]: true, ...(newClass as object) };
    }
  } else {
    if (newClass instanceof Array) {
      return [base, ...newClass];
    } else if (newClass instanceof String || typeof newClass === "string") {
      return { ...(base as object), [newClass as string]: true };
    } else {
      return { ...(base as object), ...(newClass as object) };
    }
  }
}
