<template lang="pug">
  base-layout(:title="$store.getters.repoName")
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
        @click="$store.actions.showPreference")

      drawer-navigation(
        icon="home", text="Back to Home",
        :to="{ path: '/', replace: true }")

      drawer-navigation(
        icon="info_outline", text="About",
        @click="$store.actions.showVersionDialog()")

    keep-alive
      component(:is="sidebar")
    v-tabs(:tabs="$store.state.tabs.tabs",
           :selected-index.sync="selectedTabIndex",
           @tab-close="$store.actions.tabs.remove($event.index)")
      keep-alive(slot-scope="{ tab }")
        tab-log(v-if="tab.kind === 'log'")
        div.md-headline(v-else, :style="{ margin: 'auto', color: '#888' }") NOT IMPLEMENTED (kind: {{ tab.kind }})
</template>

<script lang="ts">
import Vue from "vue";
import { componentWithStore } from "../store";
import BaseLayout from "./BaseLayout.vue";
import TabLog from "./RepositoryPageTabLog.vue";
import TabDummy from "./RepositoryPageTabDummy.vue";
import SideBarBranches from "./SideBarBranches.vue";
import SideBarRemotes from "./SideBarRemotes.vue";
import VIconButton from "./base/VIconButton.vue";
import VTabs from "./base/VTabs.vue";
import DrawerNavigation from "./DrawerNavigation.vue";

// @vue/component
export default componentWithStore({
  components: {
    BaseLayout,
    DrawerNavigation,
    VIconButton,
    VTabs,
    TabLog,
    TabDummy
  },
  computed: {
    sidebar(): typeof Vue | undefined {
      switch (this.$store.state.sidebar) {
        case "branches":
          return SideBarBranches;
        case "remotes":
          return SideBarRemotes;
        default:
          return undefined;
      }
    },
    selectedTabIndex: {
      get(): number {
        return this.$store.state.tabs.selectedIndex;
      },
      set(value: number): void {
        this.$store.actions.tabs.select(value);
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
