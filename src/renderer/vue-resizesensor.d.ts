declare module "vue-resizesensor" {
  import Vue from "vue";
  import { TsxComponent } from "vue-tsx-support";
  const VueResizeSensor: TsxComponent<
    Vue,
    { debounce?: boolean },
    { onResized: () => void }
  >;
  export = VueResizeSensor;
}
