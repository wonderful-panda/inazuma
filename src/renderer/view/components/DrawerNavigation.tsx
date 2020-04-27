import { modifiers as m } from "vue-tsx-support";
import * as vca from "vue-tsx-support/lib/vca";
import p from "vue-strict-prop";
import { MdIcon, MdListItem } from "./base/md";

// @vue/component
export default vca.component({
  name: "DrawerNavigation",
  props: {
    icon: p(String).required,
    text: p(String).required,
    action: p.ofFunction<() => void>().optional
  },
  setup(p) {
    return () => {
      const onClick = p.action instanceof Function ? p.action : () => {};
      return (
        <MdListItem onClick={m.stop(onClick)}>
          <MdIcon>{p.icon}</MdIcon>
          <span class="md-list-item-text md-subheading">{p.text}</span>
        </MdListItem>
      );
    };
  }
});
