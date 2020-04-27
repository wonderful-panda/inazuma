import * as vca from "vue-tsx-support/lib/vca";
import { useRootModule } from "../store";
import p from "vue-strict-prop";
import VBackdropSpinner from "./base/VBackdropSpinner";
import BlamePanel from "./BlamePanel";
import * as emotion from "emotion";
import { onMounted } from "@vue/composition-api";
import { provideStorageWithAdditionalNamespace } from "./injection/storage";
const css = emotion.css;

const style = css`
  margin: 0.5em 1em 0.2em 1em;
`;

export default vca.component({
  props: {
    tabkey: p(String).required,
    path: p(String).required,
    sha: p(String).required,
    blame: p.ofObject<Blame>().optional
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
