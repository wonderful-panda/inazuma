<template lang="pug">
v-splitter-panel(:class="$style.splitterPanel", direction="horizontal", :splitter-width="5", :ratio.sync="displayState.splitterPosition")
  log-table(
    slot="first",
    :items="$store.getters.items",
    :row-height="$store.state.rowHeight",
    :selected-index="$store.state.selectedIndex",
    :widths.sync="displayState.columnWidths",
    @rowclick="$store.actions.setSelectedIndex($event.index)",
    @rowdragover="onRowdragover",
    @rowdrop="onRowdrop")
  keep-alive(slot="second")
    revision-log-working-tree(v-if="$store.state.selectedCommit.id === '--'")
    revision-log-commit-detail(v-else)
</template>

<script lang="ts">
import { RowEventArgs } from "vue-vtable";
import { componentWithStore } from "../store";
import * as ds from "view/common/displayState";
import RevisionLogWorkingTree from "./RevisionLogWorkingTree.vue";
import RevisionLogCommitDetail from "./RevisionLogCommitDetail.vue";
import LogTable from "./LogTable.vue";
import VIconButton from "view/common/components/VIconButton.vue";
import VSplitterPanel from "view/common/components/VSplitterPanel.vue";
import { dragdrop } from "../dragdrop";
import { LogItem } from "../mainTypes";

// @vue/component
export default componentWithStore({
  name: "RepositoryPageTabLog",
  components: {
    LogTable,
    RevisionLogWorkingTree,
    RevisionLogCommitDetail,
    VIconButton,
    VSplitterPanel
  },
  mixins: [ds.createMixin("TheRevisionLogPage")],
  data() {
    return {
      displayState: {
        splitterPosition: 0.6,
        columnWidths: undefined as number[] | undefined
      }
    };
  },
  methods: {
    onRowdragover({ item, event }: RowEventArgs<LogItem, DragEvent>) {
      if (item.commit.id === "--") {
        return;
      }
      if (dragdrop.isDataPresent(event, "git/branch")) {
        event.dataTransfer.dropEffect = "move";
        event.preventDefault();
      }
    },
    onRowdrop({ item, event }: RowEventArgs<LogItem, DragEvent>) {
      if (item.commit.id === "--") {
        return;
      }
      const data = dragdrop.getData(event, "git/branch");
      console.log(data);
    },
    reload() {
      location.reload();
    },
    runInteractiveShell() {
      this.$store.actions.runInteractiveShell();
    }
  }
});
</script>

<style module>
.splitterPanel {
  flex: 1;
  margin: 2px;
}
</style>
