import { VNode } from "vue";
import { storeComponent } from "../store";
import SideBarBase from "./SideBarBase";
import SideBarBranchList from "./SideBarBranchList";
import * as emotion from "emotion";
const css = emotion.css;

// @vue/component
export default storeComponent.create({
  name: "SideBarBranches",
  render(): VNode {
    const refs = this.state.refs;
    return (
      <SideBarBase title="Branches">
        <div class={style.wrapper}>
          <SideBarBranchList
            key="local branches"
            title="Local branches"
            branches={refs.heads}
            onClick={r => this.actions.selectCommit(r.id)}
          />
          <SideBarBranchList
            key="tags"
            title="Tags"
            branches={refs.tags}
            onClick={r => this.actions.selectCommit(r.id)}
          />
          {Object.keys(refs.remotes).map(name => {
            const r = refs.remotes[name];
            const key = "remote/" + name;
            return (
              <SideBarBranchList
                key={key}
                title={key}
                branches={r}
                onClick={r => this.actions.selectCommit(r.id)}
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
