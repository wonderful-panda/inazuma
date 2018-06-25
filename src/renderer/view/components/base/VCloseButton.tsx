import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import VIconButton from "./VIconButton";

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

const style = css`
  .${"closeButton"} {
    min-width: 32px;
    min-height: 32px;
    margin: 0;
    padding: auto;
    :global(.md-icon) {
      font-size: 20px !important;
    }
  }
`;
