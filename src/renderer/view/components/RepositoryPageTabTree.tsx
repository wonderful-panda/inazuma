import p from "vue-strict-prop";
import { withStore, rootModule } from "../store";
import { VNode } from "vue";
import VBackdropSpinner from "./base/VBackdropSpinner";
import LstreePanel from "./LstreePanel";

export default withStore.create({
  name: "RepositoryPageTabTree",
  props: {
    tabkey: p(String).required,
    sha: p(String).required,
    rootNodes: p.ofRoArray<LsTreeEntry>().optional
  },
  methods: rootModule.mapActions(["loadTreeTabLazyProps"]),
  mounted() {
    this.loadTreeTabLazyProps({ key: this.tabkey });
  },
  render(): VNode {
    if (!this.rootNodes) {
      return <VBackdropSpinner />;
    } else {
      return <LstreePanel rootNodes={this.rootNodes} sha={this.sha} />;
    }
  }
});
