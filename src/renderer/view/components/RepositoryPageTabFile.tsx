import * as vca from "vue-tsx-support/lib/vca";
import { useRootModule } from "../store";
import VBackdropSpinner from "./base/VBackdropSpinner";
import BlamePanel from "./BlamePanel";
import { css } from "emotion";
import { onMounted } from "@vue/composition-api";
import { provideStorageWithAdditionalNamespace } from "./injection/storage";
import { optional, required } from "./base/prop";

const style = css`
  margin: 0.5em 1em 0.2em 1em;
`;

export default vca.component({
  name: "RepositoryPageTabFile",
  props: {
    tabkey: required(String),
    path: required(String),
    sha: required(String),
    blame: optional<Blame>()
  },
  setup(props) {
    const rootCtx = useRootModule();
    provideStorageWithAdditionalNamespace("TabFile");

    onMounted(() => {
      rootCtx.actions.loadFileTabLazyProps({ key: props.tabkey });
    });

    return () => {
      if (!props.blame) {
        return <VBackdropSpinner />;
      } else {
        return (
          <BlamePanel
            class={style}
            path={props.path}
            sha={props.sha}
            blame={props.blame}
          />
        );
      }
    };
  }
});
