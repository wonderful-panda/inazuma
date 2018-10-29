import { VNode } from "vue";
import { storeComponent } from "../store";
import p from "vue-strict-prop";
import VBackdropSpinner from "./base/VBackdropSpinner";
import BlamePanel from "./BlamePanel";
import { browserCommand } from "core/browser";
import * as emotion from "emotion";
const css = emotion.css;

const style = css`
  margin: 0.5em 1em 0.2em 1em;
`;

export default storeComponent.create({
  name: "RepositoryPageTabFile",
  props: {
    path: p(String).required,
    sha: p(String).required
  },
  data() {
    return {
      blame: undefined as undefined | Blame
    };
  },
  async mounted() {
    try {
      this.blame = await browserCommand.getBlame({
        repoPath: this.$store.state.repoPath,
        relPath: this.path,
        sha: this.sha
      });
    } catch (e) {
      this.$store.actions.showError(e);
    }
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
