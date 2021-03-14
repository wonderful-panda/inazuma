import { evaluateSlot } from "core/utils";
import { modifiers as m } from "vue-tsx-support";
import * as vca from "vue-tsx-support/lib/vca";
import { MdButton, MdTooltip } from "./md";
import { optional, required } from "./prop";

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
    action: required<(() => void) | "menu-trigger">()
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
      const spread =
        p.action === "menu-trigger"
          ? { attrs: { "md-menu-trigger": true } }
          : { on: { click: m.stop(p.action) } };
      return (
        <MdButton class={classes} href={p.href} disabled={p.disabled} {...spread}>
          {evaluateSlot(ctx, "default")}
          {tooltip}
        </MdButton>
      );
    };
  }
});
