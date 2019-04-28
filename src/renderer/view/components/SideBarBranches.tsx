import { VNode } from "vue";
import SideBarBase from "./SideBarBase";
import SideBarBranchList from "./SideBarBranchList";
import * as emotion from "emotion";
import { rootModule, withStore } from "view/store";
const css = emotion.css;

// @vue/component
export default withStore.create({
  name: "SideBarBranches",
  methods: {
    ...rootModule.mapActions(["selectCommit"]),
    selectCommitByRef(r: Ref) {
      this.selectCommit({ commitId: r.id });
    }
  },
  render(): VNode {
    const refs = this.state.refs;
    return (
      <SideBarBase title="Branches">
        <div class={style.wrapper}>
          <SideBarBranchList
            key="local branches"
            title="Local branches"
            branches={refs.heads}
            onClick={this.selectCommitByRef}
          />
          <SideBarBranchList
            key="tags"
            title="Tags"
            branches={refs.tags}
            onClick={this.selectCommitByRef}
          />
          {Object.keys(refs.remotes).map(name => {
            const r = refs.remotes[name];
            const key = "remote/" + name;
            return (
              <SideBarBranchList
                key={key}
                title={key}
                branches={r}
                onClick={this.selectCommitByRef}
              />
            );
          })}
        </div>
      </SideBarBase>
    );
  }
});

const style = {
  wrapper: css`
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
    margin: 0;
    padding: 0.5em;
    overflow-x: hidden;
    overflow-y: auto;
  `
};
