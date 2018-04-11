<template lang="pug">
  base-layout(title="Inazuma")
    template(slot="drawer-navigations")
      drawer-navigation(
        icon="settings", text="Preference",
        :to="{ path: 'preference', append: true }")

      drawer-navigation(
        icon="info_outline", text="About",
        @click="$store.actions.showVersionDialog()")

    div(:class="$style.content")
      h3.md-title SELECT REPOSITORY
      div(:class="$style.leftPanel")
        md-list.md-double-line
          md-list-item(@click="selectRepository")
            md-icon.md-dense search
            div.md-list-item-text
              span.md-subheading(:class="$style.repoName") BROWSE...
              span.md-caption(:class="$style.repoDescription") Select repositories by folder browser

          md-divider(:class="$style.divider")

          md-subheader.md-primary Recent opened

          md-list-item(v-for="repo in recentOpened", :key="repo", @click="openRepository(repo)")
            md-icon history
            div.md-list-item-text
              span.md-subheading(:class="$style.repoName") {{ getFileName(repo) }}
              span.md-caption(:class="$style.repoDescription") {{ repo }}
</template>

<script lang="ts">
import * as Electron from "electron";
import { componentWithStore } from "../store";
import BaseLayout from "./BaseLayout.vue";
import DrawerNavigation from "./DrawerNavigation.vue";
import { getFileName, normalizePathSeparator } from "core/utils";
import { navigate } from "../route";
const { dialog, BrowserWindow } = Electron.remote;

// @vue/component
export default componentWithStore({
  name: "TheWelcomePage",
  components: {
    BaseLayout,
    DrawerNavigation
  },
  computed: {
    recentOpened(): string[] {
      return this.$store.state.environment.recentOpened;
    }
  },
  methods: {
    getFileName,
    openRepository(repoPath: string): void {
      navigate.log(repoPath);
    },
    selectRepository(): void {
      const paths = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        properties: ["openDirectory"]
      });
      if (typeof paths === "undefined") {
        return;
      }
      const repoPath = normalizePathSeparator(paths[0]);
      navigate.log(repoPath);
    }
  }
});
</script>

<style lang="scss" module>
.content {
  flex: 1;
  padding: 0 1em;
}

.leftPanel {
  display: inline-block;
  min-width: 40%;

  :global {
    .md-list {
      background-color: var(--md-theme-default-background-on-background);
      padding: 0 0.5em;
    }
    .md-list-item-content {
      min-height: 32px !important;
    }
    .md-subheader {
      min-height: 32px !important;
    }
    .md-icon {
      margin-right: 0.5em !important;
    }
  }
}

.repoName {
  height: 20px;
  margin-right: auto;
  text-transform: none !important;
}
.repoDescription {
  text-transform: none !important;
  font-size: 75%;
}
.divider {
  margin: 0.5em 0 !important;
}
</style>
