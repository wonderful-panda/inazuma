import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { MdButton, MdTooltip } from "./md";
const m = tsx.modifiers;

// @vue/component
export default tsx.component({
  name: "VButton",
  props: {
    href: String,
    tooltip: String,
    mini: Boolean,
    raised: Boolean,
    disabled: Boolean,
    primary: Boolean,
    accent: Boolean,
    action: p.ofFunction<() => void>().required
  },
  computed: {
    classes(): object {
      return {
        "md-mini": this.mini,
        "md-raised": this.raised,
        "md-primary": this.primary,
        "md-accent": this.accent
      };
    }
  },
  render(): VNode {
    const tooltip = this.tooltip ? (
      <MdTooltip>{this.tooltip}</MdTooltip>
    ) : (
      undefined
    );
    return (
      <MdButton
        class={this.classes}
        href={this.href}
        disabled={this.disabled}
        onClick={m.stop(this.action)}
      >
        {this.$slots.default}
        {tooltip}
      </MdButton>
    );
  }
});
