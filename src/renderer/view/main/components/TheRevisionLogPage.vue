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
    v-splitter-panel(id="main-splitter-panel", direction="horizontal", :splitter-width="5", :initial-ratio="0.6")
      log-table(slot="first")
      keep-alive(slot="second")
        revision-log-working-tree(v-if="$store.state.selectedCommit.id === '--'")
        revision-log-commit-detail(v-else)
</template>

<script lang="ts">
import Vue from "vue";
import { componentWithStore } from "../store";
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
    reload() {
      location.reload();
    },
    runInteractiveShell() {
      this.$store.actions.runInteractiveShell();
    }
  }
});
</script>

<style>
#main-splitter-panel {
  flex: 1;
  margin: 2px;
}
</style>
