import { css } from "@emotion/css";
import { modifiers as m } from "vue-tsx-support";
import * as vca from "vue-tsx-support/lib/vca";
import { MdListItem } from "./base/md";
import { required, optional } from "./base/prop";
import { VMaterialIcon, MaterialIconNames } from "./base/VMaterialIcon";
import { withclass } from "./base/withClass";

const HeadIcon = withclass(VMaterialIcon)(css`
  margin: 0 1em;
`);

// @vue/component
export default vca.component({
  name: "DrawerNavigation",
  props: {
    icon: required<MaterialIconNames>(String),
    text: required(String),
    action: optional(Function)
  },
  setup(p) {
    return () => {
      const onClick = p.action instanceof Function ? p.action : () => {};
      return (
        <MdListItem onClick={m.stop(onClick)}>
          <HeadIcon name={p.icon} />
          <span class="md-list-item-text md-subheading">{p.text}</span>
        </MdListItem>
      );
    };
  }
});
