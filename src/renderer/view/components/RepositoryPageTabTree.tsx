import p from "vue-strict-prop";
import * as vca from "vue-tsx-support/lib/vca";
import { useRootModule } from "../store";
import VBackdropSpinner from "./base/VBackdropSpinner";
import LstreePanel from "./LstreePanel";
import { onMounted } from "@vue/composition-api";
import {
  provideNamespacedStorage,
  injectNamespacedStorage
} from "./base/useStorage";

export default vca.component({
  props: {
    tabkey: p(String).required,
    sha: p(String).required,
    rootNodes: p.ofRoArray<LsTreeEntry>().optional
  },
  setup(props) {
    const rootCtx = useRootModule();
    const storage = injectNamespacedStorage();
    if (storage) {
      provideNamespacedStorage(storage.subStorage("TabTree"));
    }

    onMounted(() => {
      rootCtx.actions.loadTreeTabLazyProps({ key: props.tabkey });
    });
    return () => {
      if (!props.rootNodes) {
        return <VBackdropSpinner />;
      } else {
        return <LstreePanel rootNodes={props.rootNodes} sha={props.sha} />;
      }
    };
  }
});
