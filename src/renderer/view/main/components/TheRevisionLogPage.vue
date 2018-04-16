<template lang="pug">
  base-layout(:title="repoName")
    template(slot="titlebar-buttons")
      v-icon-button(mini, :disabled="!$store.state.config.interactiveShell",
                    tooltip="launch interactive shell",
                    @click="runInteractiveShell") input
      v-icon-button(mini, tooltip="reload", @click="reload") refresh

    template(slot="drawer-navigations")
      drawer-navigation(
        icon="local_offer", text="Branches",
        @click="$store.actions.showSidebar('branches')")

      drawer-navigation(
        icon="cloud", text="Remotes",
        @click="$store.actions.showSidebar('remotes')")

      drawer-navigation(
        icon="settings", text="Preferences",
        :to="{ path: 'preference', append: true }")

      drawer-navigation(
        icon="home", text="Back to Home",
        :to="{ name: 'root', replace: true }")

      drawer-navigation(
        icon="info_outline", text="About",
        @click="$store.actions.showVersionDialog()")

    keep-alive
      component(:is="sidebar")
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
import Vue from "vue";
import { RowEventArgs } from "vue-vtable";
import { componentWithStore } from "../store";
import * as ds from "view/common/displayState";
import RevisionLogWorkingTree from "./RevisionLogWorkingTree.vue";
import RevisionLogCommitDetail from "./RevisionLogCommitDetail.vue";
import BaseLayout from "./BaseLayout.vue";
import LogTable from "./LogTable.vue";
import SideBarBranches from "./SideBarBranches.vue";
import SideBarRemotes from "./SideBarRemotes.vue";
import VIconButton from "view/common/components/VIconButton.vue";
import VSplitterPanel from "view/common/components/VSplitterPanel.vue";
import DrawerNavigation from "./DrawerNavigation.vue";
import { getFileName } from "core/utils";
import { dragdrop } from "../dragdrop";
import { LogItem } from "../mainTypes";

// @vue/component
export default componentWithStore({
  components: {
    BaseLayout,
    LogTable,
    DrawerNavigation,
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
  computed: {
    repoPath(): string {
      return this.$store.state.repoPath;
    },
    repoPathEncoded(): string {
      return encodeURIComponent(this.repoPath);
    },
    repoName(): string {
      return getFileName(this.repoPath) || this.repoPath;
    },
    sidebar(): typeof Vue | undefined {
      switch (this.$store.state.sidebar) {
        case "branches":
          return SideBarBranches;
        case "remotes":
          return SideBarRemotes;
        default:
          return undefined;
      }
    }
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
