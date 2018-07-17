import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import VIconButton from "./VIconButton";

// @vue/component
export default tsx.component({
  name: "VCloseButton",
  functional: true,
  props: {
    disabled: Boolean,
    action: p.ofFunction<() => void>().required
  },
  render(_h, { props: { disabled, action }, data }): VNode {
    return (
      <VIconButton
        class={style.closeButton}
        disabled={disabled}
        action={action}
        {...data}
      >
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
