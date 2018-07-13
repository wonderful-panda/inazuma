import Vue, { VueConstructor } from "vue";
import { RecordPropsDefinition, ArrayPropsDefinition } from "vue/types/options";
import { TsxComponent } from "vue-tsx-support";

type RequiredProps<Props, PD extends RecordPropsDefinition<Props>> = ({
  [K in keyof PD]: PD[K] extends { required: true } ? K : never
})[keyof Props];

type OptionalProps<Props, PD extends RecordPropsDefinition<Props>> = Exclude<
  keyof Props,
  RequiredProps<Props, PD>
>;

// prettier-ignore
export type OuterProps<
  Props,
  PropDefs extends RecordPropsDefinition<Props> | ArrayPropsDefinition<Props>
> = PropDefs extends RecordPropsDefinition<Props> ?
        { [K in RequiredProps<Props, PropDefs>]: Props[K] }
      & { [K in OptionalProps<Props, PropDefs>]?: Props[K] }
    : PropDefs extends ArrayPropsDefinition<Props> ?
      { [K in keyof Props]?: any }
    : never;

export type AsComponent<
  C extends VueConstructor | string
> = C extends keyof JSX.IntrinsicElements
  ? TsxComponent<Vue, JSX.IntrinsicElements[C]>
  : C extends string ? TsxComponent<Vue, any> : C;

export type WithProps<C extends VueConstructor, Props> = C extends TsxComponent<
  infer V,
  infer P,
  infer E,
  infer S,
  infer A
>
  ? TsxComponent<V, P & Props, E, S, A>
  : C extends VueConstructor<infer V> ? TsxComponent<V, Props> : never;
