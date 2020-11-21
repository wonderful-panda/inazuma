declare module "vue-support" {
  import Vue, { VueConstructor } from "vue";
  import { RecordPropsDefinition, ArrayPropsDefinition } from "vue/types/options";
  import { _TsxComponentV3 } from "vue-tsx-support";
  import { ComponentProps, WithProps } from "vue-tsx-support/lib/advance";
  import { PropsOf as PropsOf_ } from "vue-tsx-support/types/base";

  type RequiredProps<Props, PD extends RecordPropsDefinition<Props>> = {
    [K in keyof PD]: PD[K] extends { required: true } ? K : never;
  }[keyof Props];

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
  > = C extends keyof VueTsxSupport.JSX.IntrinsicElements
    ? _TsxComponentV3<Vue, {}, VueTsxSupport.JSX.IntrinsicElements[C], {}, {}, {}>
    : C extends string
    ? _TsxComponentV3<Vue, {}, any, {}, {}, {}>
    : C;

  export type ExtendProps<C extends VueConstructor, Props> = WithProps<
    C,
    ComponentProps<C> & Props
  >;
}
