import { VNode } from "vue";
import VSplitterPanel from "./base/VSplitterPanel";
import FileTable from "./FileTable";
import * as md from "view/utils/md-classes";
import * as ds from "view/store/displayState";
import { __sync } from "view/utils/modifiers";
import * as emotion from "emotion";
import { rootModule, withStore } from "view/store";
const css = emotion.css;

const displayState = ds.createMixin("RevisionLogWorkingTree", {
  splitterPosition: 0.5,
  stagedColumnWidths: {} as Dict<number>,
  unstagedColumnWidths: {} as Dict<number>
});

export default withStore.mixin(displayState).create(
  // @vue/component
  {
    name: "RevisionLogWorkingTree",
    computed: {
      stagedFiles(): FileEntry[] {
        return this.state.selectedCommit.files.filter(f => {
          return f.inIndex;
        });
      },
      unstagedFiles(): FileEntry[] {
        return this.state.selectedCommit.files.filter(f => {
          return f.inWorkingTree;
        });
      }
    },
    methods: {
      ...rootModule.mapActions(["showExternalDiff"]),
      showExternalDiffCommittedAndStaged({ item }: { item: FileEntry }) {
        if (item.statusCode !== "M" && !item.statusCode.startsWith("R")) {
          return;
        }
        this.showExternalDiff({
          left: { path: item.oldPath || item.path, sha: "HEAD" },
          right: { path: item.path, sha: "STAGED" }
        });
      },
      showExternalDiffStagedAndUnstaged({ item }: { item: FileEntry }) {
        if (item.statusCode !== "M" && !item.statusCode.startsWith("R")) {
          return;
        }
        this.showExternalDiff({
          left: { path: item.path, sha: "STAGED" },
          right: { path: item.path, sha: "UNSTAGED" }
        });
      }
    },
    render(): VNode {
      return (
        <VSplitterPanel
          staticClass={style.container}
          direction="vertical"
          splitterWidth={5}
          minSizeFirst="20%"
          minSizeSecond="20%"
          ratio={__sync(this.displayState.splitterPosition)}
        >
          <div slot="first" staticClass={style.splitterPane}>
            <div staticClass={md.TITLE}>Changes to be committed</div>
            <FileTable
              files={this.stagedFiles}
              widths={__sync(this.displayState.stagedColumnWidths)}
              onRowdblclick={this.showExternalDiffCommittedAndStaged}
            />
          </div>
          <div slot="second" staticClass={style.splitterPane}>
            <div staticClass={md.TITLE}>Changes not staged</div>
            <FileTable
              files={this.unstagedFiles}
              widths={__sync(this.displayState.unstagedColumnWidths)}
              onRowdblclick={this.showExternalDiffStagedAndUnstaged}
            />
          </div>
        </VSplitterPanel>
      );
    }
  }
);

const style = {
  container: css`
    display: flex;
    flex: 1;
    flex-flow: column nowrap;
    padding: 8px;
  `,
  splitterPane: css`
    display: flex;
    flex: 1;
    flex-flow: column nowrap;
    padding: 0;
  `
};
