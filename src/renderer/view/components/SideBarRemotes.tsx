import * as vca from "vue-tsx-support/lib/vca";
import SideBarBase from "./SideBarBase";
import { useRootModule } from "view/store";

export default vca.component({
  name: "SideBarRemotes",
  setup() {
    const rootModule = useRootModule();
    return () => (
      <SideBarBase title="Remotes" hide={rootModule.actions.hideSidebar}>
        Not implemented
      </SideBarBase>
    );
  }
});
