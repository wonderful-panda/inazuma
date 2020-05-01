import * as vca from "vue-tsx-support/lib/vca";
import { useRootModule } from "../store";
import VBackdropSpinner from "./base/VBackdropSpinner";
import LstreePanel from "./LstreePanel";
import { onMounted } from "@vue/composition-api";
import { provideStorageWithAdditionalNamespace } from "./injection/storage";
import { required, optional } from "./base/prop";

export default vca.component({
  props: {
    tabkey: required(String),
    sha: required(String),
    rootNodes: optional<readonly LsTreeEntry[]>(Array)
  },
  setup(props) {
    const rootCtx = useRootModule();
    provideStorageWithAdditionalNamespace("TabTree");

    onMounted(() => {
      rootCtx.actions.loadTreeTabLazyProps({ key: props.tabkey });
    });
    return () => {
      if (!props.rootNodes) {
        return <VBackdropSpinner />;
      } else {
        return (
          <LstreePanel
            repoPath={rootCtx.state.repoPath}
            rootNodes={props.rootNodes}
            sha={props.sha}
          />
        );
      }
    };
  }
});
