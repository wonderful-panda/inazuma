<script lang="tsx">
import { VNode } from "vue";
import { componentWithStore } from "../store";
import VSplitterPanel from "view/common/components/VSplitterPanel.vue";
import FileTable from "./FileTable.vue";
import * as md from "view/common/md-classes";
import * as ds from "view/common/displayState";
import { __sync } from "view/common/modifiers";

// @vue/component
export default componentWithStore({
  name: "RevisionLogWorkingTree",
  mixins: [ds.createMixin("main/RevisionLogWorkingTree")],
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
    const s = this.$style;
    return (
      <VSplitterPanel
        staticClass={s.container}
        direction="vertical"
        splitterWidth={5}
        minSizeFirst="20%"
        minSizeSecond="20%"
        ratio={__sync(this.displayState.splitterPosition)}
      >
        <div slot="first" staticClass={s.splitterPane}>
          <div staticClass={md.TITLE}>Changes to be committed</div>
          <FileTable
            files={this.stagedFiles}
            widths={__sync(this.displayState.stagedColumnWidths)}
            onRowdblclick={arg => this.showExternalDiff(arg.item, true)}
          />
        </div>
        <div slot="second" staticClass={s.splitterPane}>
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
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex: 1;
  flex-flow: column nowrap;
  padding: 8px;
}

.splitterPane {
  display: flex;
  flex: 1;
  flex-flow: column nowrap;
  padding: 0;
}
</style>
