<script lang="tsx">
import Vue, { VNode } from "vue";
import VButton from "./VButton.vue";

// @vue/component
export default Vue.extend({
  name: "VIconButton",
  functional: true,
  render(_h, { data, children }): VNode {
    return (
      <VButton class="md-icon-button" {...data}>
        <md-icon>{children}</md-icon>
      </VButton>
    );
  }
}) as typeof VButton;
</script>
