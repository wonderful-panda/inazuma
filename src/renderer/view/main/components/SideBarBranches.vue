<script lang="tsx">
import { VNode } from "vue";
import { componentWithStore } from "../store";
import SideBarBase from "./SideBarBase.vue";
import SideBarBranchList from "./SideBarBranchList.vue";

// @vue/component
export default componentWithStore({
  name: "SideBarBranches",
  render(): VNode {
    const refs = this.$store.state.refs;
    return (
      <SideBarBase title="Branches">
        <div class={this.$style.wrapper}>
          <SideBarBranchList
            key="local branches"
            title="Local branches"
            branches={refs.heads}
            onClick={r => this.$store.actions.selectCommit(r.id)}
          />
          <SideBarBranchList
            key="tags"
            title="Tags"
            branches={refs.tags}
            onClick={r => this.$store.actions.selectCommit(r.id)}
          />
          {Object.keys(refs.remotes).map(name => {
            const r = refs.remotes[name];
            const key = "remote/" + name;
            return (
              <SideBarBranchList
                key={key}
                title={key}
                branches={r}
                onClick={r => this.$store.actions.selectCommit(r.id)}
              />
            );
          })}
        </div>
      </SideBarBase>
    );
  }
});
</script>

<style lang="scss" module>
.wrapper {
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  margin: 0;
  padding: 0.5em;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
