import { modifiers as m } from "vue-tsx-support";
import * as vca from "vue-tsx-support/lib/vca";
import { MdButton, MdTooltip } from "./md";
import { required, optional } from "./prop";

export default vca.component({
  name: "VButton",
  props: {
    href: optional(String),
    tooltip: optional(String),
    mini: optional(Boolean),
    raised: optional(Boolean),
    disabled: optional(Boolean),
    primary: optional(Boolean),
    accent: optional(Boolean),
    action: required(Function)
  },
  setup(p, ctx) {
    return () => {
      const classes = {
        "md-mini": p.mini,
        "md-raised": p.raised,
        "md-primary": p.primary,
        "md-accent": p.accent
      };

      const tooltip = p.tooltip ? <MdTooltip>{p.tooltip}</MdTooltip> : undefined;
      return (
        <MdButton class={classes} href={p.href} disabled={p.disabled} onClick={m.stop(p.action)}>
          {ctx.slots.default()}
          {tooltip}
        </MdButton>
      );
    };
  }
});
