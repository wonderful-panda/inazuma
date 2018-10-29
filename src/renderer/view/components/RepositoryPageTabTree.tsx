import p from "vue-strict-prop";
import { storeComponent } from "../store";
import { browserCommand } from "core/browser";
import { sortTreeInplace } from "core/tree";
import { VNode } from "vue";
import VBackdropSpinner from "./base/VBackdropSpinner";
import LstreePanel from "./LstreePanel";

export default storeComponent.create({
  name: "RepositoryPageTabTree",
  props: {
    sha: p(String).required
  },
  data() {
    return {
      rootNodes: undefined as undefined | ReadonlyArray<LsTreeEntry>
    };
  },
  async mounted() {
    try {
      const repoPath = this.$store.state.repoPath;
      const sha = this.sha;
      const rootNodes = await browserCommand.getTree({ repoPath, sha });
      sortTreeInplace(rootNodes, (a, b) => {
        return (
          a.data.type.localeCompare(b.data.type) * -1 || // tree, then blob
          a.data.basename.localeCompare(b.data.basename)
        );
      });
      this.rootNodes = rootNodes;
    } catch (e) {
      this.$store.actions.showError(e);
    }
  },
  render(): VNode {
    if (!this.rootNodes) {
      return <VBackdropSpinner />;
    } else {
      return <LstreePanel rootNodes={this.rootNodes} sha={this.sha} />;
    }
  }
});
