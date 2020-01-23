import Vue, { VNode } from "vue";
import VButton from "./VButton";
import { MdIcon } from "./md";

// @vue/component
export default Vue.extend({
  name: "VIconButton",
  functional: true,
  render(_h, { data, children }): VNode {
    return (
      <VButton class="md-icon-button" {...(data as any)}>
        <MdIcon>{children}</MdIcon>
      </VButton>
    );
  }
}) as typeof VButton;
