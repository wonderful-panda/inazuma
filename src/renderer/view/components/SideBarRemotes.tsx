import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import SideBarBase from "./SideBarBase";

// @vue/component
export default tsx.component({
  name: "SideBarRemotes",
  render(): VNode {
    return <SideBarBase title="Remotes">Not implemented</SideBarBase>;
  }
});
