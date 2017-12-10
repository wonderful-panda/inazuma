<template lang="pug">
    base-layout(:title="repoName")
        template(slot="titlebar-buttons")
            v-icon-button(mini, :disabled="!$store.state.config.interactiveShell",
                          @click="runInteractiveShell") input
            v-icon-button(mini, @click="reload") refresh

        template(slot="drawer-navigations")
            md-list-item(@click="$store.actions.showSidebar('branches')")
                md-icon.md-dense local_offer
                span.md-list-item-text Branches

            md-list-item(@click="$store.actions.showSidebar('remotes')")
                md-icon.md-dense cloud
                span.md-list-item-text Remotes

            md-list-item(:to="{ path: 'preference', append: true }")
                md-icon.md-dense settings
                span.md-list-item-text Preference

            md-list-item(:to="{ name: 'root', replace: true }")
                md-icon.md-dense home
                span.md-list-item-text Back to Home

            md-list-item(@click="$store.actions.showVersionDialog()")
                md-icon.md-dense info_outline
                span.md-list-item-text About

        keep-alive
            transition(name="sidebar")
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
import { getFileName } from "core/utils";

export default componentWithStore({
    components: {
        BaseLayout,
        LogTable,
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
