<script lang="tsx">
import { VNode } from "vue";
import { componentWithStore } from "../store";
import FileTable from "./FileTable.vue";

// @vue/component
export default componentWithStore({
  name: "RevisionLogWorkingTree",
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
    return (
      <div staticClass="commit-detail">
        <div staticClass="md-title">Changes to be committed</div>
        <FileTable staticClass="staged-files" files={this.stagedFiles} />
        <div staticClass="md-title">Changes not staged</div>
        <FileTable staticClass="unstaged-files" files={this.unstagedFiles} />
      </div>
    );
  }
});
</script>

<style lang="scss">
.commit-detail {
  display: flex;
  flex: 1;
  flex-flow: column nowrap;
  padding: 8px;

  .commit-detail-summary {
    padding: 4px;
    margin-bottom: 8px;
  }
}
</style>
