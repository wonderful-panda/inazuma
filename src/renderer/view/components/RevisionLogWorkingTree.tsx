import { VNode } from "vue";
import { componentWithStore } from "../store";
import VSplitterPanel from "./base/VSplitterPanel";
import FileTable from "./FileTable";
import * as md from "view/utils/md-classes";
import * as ds from "view/store/displayState";
import { __sync } from "view/utils/modifiers";
import * as style from "./RevisionLogWorkingTree.scss";

// @vue/component
export default componentWithStore({
  name: "RevisionLogWorkingTree",
  mixins: [ds.createMixin("RevisionLogWorkingTree")],
  data() {
    return {
      displayState: {
        splitterPosition: 0.5,
        stagedColumnWidths: undefined as number[] | undefined,
        unstagedColumnWidths: undefined as number[] | undefined
      }
    };
  },
  computed: {
    commit(): CommitDetail {
      return this.$store.state.selectedCommit;
    },
    stagedFiles(): FileEntry[] {
      return this.$store.state.selectedCommit.files.filter(f => {
        return f.inIndex;
      });
    },
    unstagedFiles(): FileEntry[] {
      return this.$store.state.selectedCommit.files.filter(f => {
        return f.inWorkingTree;
      });
    }
  },
  methods: {
    showExternalDiff(item: FileEntry, cached: boolean) {
      if (item.statusCode !== "M" && !item.statusCode.startsWith("R")) {
        return;
      }
      if (cached) {
        this.$store.actions.showExternalDiff(
          { path: item.oldPath || item.path, sha: "HEAD" },
          { path: item.path, sha: "STAGED" }
        );
      } else {
        this.$store.actions.showExternalDiff(
          { path: item.path, sha: "STAGED" },
          { path: item.path, sha: "UNSTAGED" }
        );
      }
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
            onRowdblclick={arg => this.showExternalDiff(arg.item, true)}
          />
        </div>
        <div slot="second" staticClass={style.splitterPane}>
          <div staticClass={md.TITLE}>Changes not staged</div>
          <FileTable
            files={this.unstagedFiles}
            widths={__sync(this.displayState.unstagedColumnWidths)}
            onRowdblclick={arg => this.showExternalDiff(arg.item, false)}
          />
        </div>
      </VSplitterPanel>
    );
  }
});
