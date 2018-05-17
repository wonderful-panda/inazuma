import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import VIconButton from "./VIconButton";
import * as style from "./VCloseButton.scss";

// @vue/component
export default tsx.componentFactoryOf<{ onClick: null }>().create({
  name: "VCloseButton",
  functional: true,
  props: {
    disabled: p(Boolean).default(false)
  },
  render(_h, { data }): VNode {
    return (
      <VIconButton class={style.closeButton} {...data}>
        close
      </VIconButton>
    );
  }
});
