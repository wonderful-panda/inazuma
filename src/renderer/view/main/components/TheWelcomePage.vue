<template lang="pug">
    base-layout(title="Inazuma")
        template(slot="drawer-navigations")
            drawer-navigation(
                icon="settings", text="Preference",
                :to="{ path: 'preference', append: true }")

            drawer-navigation(
                icon="info_outline", text="About",
                @click="$store.actions.showVersionDialog()")

        div(style="flex: 1; padding: 0 1em;")
            h3.md-title SELECT REPOSITORY
            div(style="display: inline-block; min-width: 30%;")
                md-list#welcome-repo-list.md-double-line
                    md-list-item(@click="selectRepository")
                        md-icon.md-dense search
                        div.md-list-item-text
                            span.repo-name.md-subheading BROWSE...
                            span.repo-description.md-caption Select repositories by folder browser

                    md-divider(style="margin: 0.5em 0")

                    md-subheader.md-primary Recent opened

                    md-list-item(v-for="repo in recentOpened", :key="repo", @click="openRepository(repo)")
                        md-icon history
                        div.md-list-item-text
                            span.repo-name.md-subheading {{ getFileName(repo) }}
                            span.repo-description.md-caption {{ repo }}
</template>

<script lang="ts">
import Vue from "vue";
import { componentWithStore } from "../store";
import BaseLayout from "./BaseLayout.vue";
import DrawerNavigation from "./DrawerNavigation.vue";
import { getFileName } from "core/utils";

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
            this.$store.actions.navigateToLog(repoPath);
        },
        selectRepository(): void {
            this.$store.actions.showRepositorySelectDialog();
        }
    }
});
</script>

<style lang="scss">
#welcome-repo-list {
    background: var(--md-theme-default-background-on-background);
    padding: 0 0.5em;

    .md-list-item-content {
        min-height: 32px !important;
    }
    .md-subheader {
        min-height: 32px !important;
    }
    .repo-name {
        height: 20px;
        margin-right: auto;
        text-transform: none !important;
    }
    .repo-description {
        text-transform: none !important;
        font-size: 75%;
    }
    .md-icon {
        margin-right: 0.5em;
    }
}
</style>
