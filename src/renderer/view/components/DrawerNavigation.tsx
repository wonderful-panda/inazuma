import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { MdIcon, MdListItem } from "./base/md";
const m = tsx.modifiers;

// @vue/component
export default tsx.component({
  name: "DrawerNavigation",
  props: {
    icon: p(String).required,
    text: p(String).required,
    action: p.ofFunction<() => void>().optional
  },
  render(): VNode {
    const onClick = this.action instanceof Function ? this.action : () => {};
    return (
      <MdListItem onClick={m.stop(onClick)}>
        <MdIcon>{this.icon}</MdIcon>
        <span class="md-list-item-text md-subheading">{this.text}</span>
      </MdListItem>
    );
  }
});
