import { VNode, RenderContext, CreateElement } from "vue";
import { TsxComponentAttrs } from "vue-tsx-support";

export interface FunctionalComponent<Props> {
  name?: string;
  render(h: CreateElement, ctx: RenderContext<Props>): VNode
}
export interface MockedFunctionalComponent<Props> {
  (props: TsxComponentAttrs<Props>): VNode;
}

export function functional<Props>(component: FunctionalComponent<Props>): MockedFunctionalComponent<Props> {
  return {
    functional: true,
    ...component
  } as any;
}
