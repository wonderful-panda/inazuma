<script lang="tsx">
import { VNode } from "vue";
import { componentWithStore } from "../store";
import FileTable from "./FileTable.vue";
import * as md from "view/common/md-classes";
import { updater } from "view/common/renderutils";
import * as ds from "view/common/displayState";

// @vue/component
export default componentWithStore({
  name: "RevisionLogWorkingTree",
  mixins: [ds.createMixin("main/RevisionLogWorkingTree")],
  data() {
    return {
      displayState: {
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
  render(): VNode {
    const s = this.$style;
    const a = this.$store.actions;
    return (
      <div staticClass={s.container}>
        <div staticClass={md.TITLE}>Changes to be committed</div>
        <FileTable
          files={this.stagedFiles}
          widths={this.displayState.stagedColumnWidths}
          {...{
            on: updater("widths", this.displayState, "stagedColumnWidths")
          }}
          onRowdblclick={arg => a.showExternalDiff(arg.item, true)}
        />
        <div staticClass={md.TITLE}>Changes not staged</div>
        <FileTable
          files={this.unstagedFiles}
          widths={this.displayState.unstagedColumnWidths}
          {...{
            on: updater("widths", this.displayState, "unstagedColumnWidths")
          }}
          onRowdblclick={arg => a.showExternalDiff(arg.item, false)}
        />
      </div>
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
</style>
