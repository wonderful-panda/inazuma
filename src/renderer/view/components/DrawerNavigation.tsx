import { modifiers as m } from "vue-tsx-support";
import * as vca from "vue-tsx-support/lib/vca";
import { MdIcon, MdListItem } from "./base/md";
import { required, optional } from "./base/prop";

// @vue/component
export default vca.component({
  name: "DrawerNavigation",
  props: {
    icon: required(String),
    text: required(String),
    action: optional(Function)
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
