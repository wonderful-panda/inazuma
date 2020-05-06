import * as vca from "vue-tsx-support/lib/vca";
import SideBarBase from "./SideBarBase";
import SideBarBranchList from "./SideBarBranchList";
import { css } from "emotion";
import { useRootModule } from "view/store";

// @vue/component
export default vca.component({
  name: "SideBarBranches",
  setup() {
    const rootModule = useRootModule();
    const selectCommitByRef = (r: Ref) =>
      rootModule.actions.selectCommit({ commitId: r.id });
    return () => {
      const {
        actions,
        state: { refs }
      } = rootModule;
      return (
        <SideBarBase title="Branches" hide={actions.hideSidebar}>
          <div class={style.wrapper}>
            <SideBarBranchList
              key="local branches"
              title="Local branches"
              branches={refs.heads}
              onClick={selectCommitByRef}
            />
            <SideBarBranchList
              key="tags"
              title="Tags"
              branches={refs.tags}
              onClick={selectCommitByRef}
            />
            {Object.keys(refs.remotes).map(name => {
              const r = refs.remotes[name];
              const key = "remote/" + name;
              return (
                <SideBarBranchList
                  key={key}
                  title={key}
                  branches={r}
                  onClick={selectCommitByRef}
                />
              );
            })}
          </div>
        </SideBarBase>
      );
    };
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
