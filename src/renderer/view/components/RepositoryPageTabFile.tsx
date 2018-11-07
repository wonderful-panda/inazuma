import { VNode } from "vue";
import { storeComponent } from "../store";
import p from "vue-strict-prop";
import VBackdropSpinner from "./base/VBackdropSpinner";
import BlamePanel from "./BlamePanel";
import * as emotion from "emotion";
const css = emotion.css;

const style = css`
  margin: 0.5em 1em 0.2em 1em;
`;

export default storeComponent.create({
  name: "RepositoryPageTabFile",
  props: {
    tabkey: p(String).required,
    path: p(String).required,
    sha: p(String).required,
    blame: p.ofObject<Blame>().optional
  },
  mounted() {
    this.$store.actions.loadFileTabLazyProps(this.tabkey);
  },
  render(): VNode {
    if (!this.blame) {
      return <VBackdropSpinner />;
    } else {
      return (
        <BlamePanel
          class={style}
          path={this.path}
          sha={this.sha}
          blame={this.blame}
        />
      );
    }
  }
});
