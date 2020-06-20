import { VueConstructor, CreateElement, VNode, RenderContext } from "vue";
import { AsComponent, ExtendProps } from "vue-support";
import { IntrinsicElements } from "vue-tsx-support/types/base";

const marker = Symbol("inazuma/vue-withclass");

type ClassBinding = string | ((props: any) => string);

type ClassedComponent = {
  functional: true;
  [marker]: null;
  render(h: CreateElement, ctx: RenderContext): VNode;
  __extend__(newClasses: ClassBinding[]): any;
};

interface ClassedComponentFactory<C extends VueConstructor | string> {
  (...staticClass: string[]): AsComponent<C>;
  <Props>(dynamicClass: (props: Props) => string): ExtendProps<
    AsComponent<C>,
    Props
  >;
}

type WithClass = {
  [K in keyof IntrinsicElements]: ClassedComponentFactory<K>;
} & {
  <C extends VueConstructor | string>(component: C): ClassedComponentFactory<C>;
};

function createClassedComponent(
  component: VueConstructor | string,
  classes: readonly ClassBinding[]
): ClassedComponent {
  const staticClasses: string[] = [];
  const dynamicClasses: Array<(props: any) => string> = [];
  classes.forEach(c => {
    if (c instanceof Function) {
      dynamicClasses.push(c);
    } else {
      staticClasses.push(c);
    }
  });
  const staticClass = staticClasses.join(" ");
  return {
    functional: true,
    [marker]: null,
    render(h: CreateElement, { props, data, slots }: RenderContext): VNode {
      const classes: string[] = [];
      if (data.staticClass) {
        classes.push(data.staticClass);
      }
      if (staticClass) {
        classes.push(staticClass);
      }
      if (dynamicClasses) {
        classes.push(...dynamicClasses.map(c => c(props)));
      }
      const s = slots();
      const children: VNode[] = [];
      for (const slot in s) {
        if (slot === "default") {
          children.push(s[slot]);
        } else {
          children.push(h("template", { slot }, s[slot]));
        }
      }
      return h(
        component,
        { ...data, staticClass: classes.join(" ") },
        children
      );
    },
    __extend__(newClasses) {
      return createClassedComponent(component, [...classes, ...newClasses]);
    }
  };
}

function isClassedComponent(component: any): component is ClassedComponent {
  return component instanceof Object && marker in component;
}

function createOrExtend(component: any, newClass: ClassBinding[]) {
  if (isClassedComponent(component)) {
    return component.__extend__(newClass);
  } else {
    return createClassedComponent(component, newClass);
  }
}

function withclass_<C extends VueConstructor | string>(
  component: C
): ClassedComponentFactory<C> {
  return (...newClass: ClassBinding[]) => createOrExtend(component, newClass);
}

export const withclass = new Proxy(withclass_, {
  get(_, prop: string) {
    return (...newClass: ClassBinding[]) => createOrExtend(prop, newClass);
  }
}) as WithClass;
