import { modifiers as m } from "vue-tsx-support";
import * as vca from "vue-tsx-support/lib/vca";
import p from "vue-strict-prop";
import { MdButton, MdTooltip } from "./md";

export default vca.component({
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
  setup(p, ctx) {
    return () => {
      const classes = {
        "md-mini": p.mini,
        "md-raised": p.raised,
        "md-primary": p.primary,
        "md-accent": p.accent
      };

      const tooltip = p.tooltip ? (
        <MdTooltip>{p.tooltip}</MdTooltip>
      ) : (
        undefined
      );
      return (
        <MdButton
          class={classes}
          href={p.href}
          disabled={p.disabled}
          onClick={m.stop(p.action)}
        >
          {ctx.slots.default()}
          {tooltip}
        </MdButton>
      );
    };
  }
});
