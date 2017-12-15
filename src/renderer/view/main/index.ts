import "./install-vue";
import Vue from "vue";
import { Route } from "vue-router";

import * as Electron from "electron";
import { store, AppStore } from "./store";
import { router } from "./route";
import { browserCommand } from "core/browser";

Electron.ipcRenderer.on("action", (event: string, name: string, payload: any) => {
    (store.actions as any)[name](payload);
});

const app = new Vue({
    el: "#app",
    store,
    router,
    watch: {
        "$route": "onRouteChanged"
    },
    created(this: any) {
        this.onRouteChanged();
    },
    methods: {
        async onRouteChanged() {
            const route: Route = this.$route;
            const { repoPathEncoded } = route.params;
            const repoPath = repoPathEncoded ? decodeURIComponent(repoPathEncoded) : "";
            if (store.state.repoPath !== repoPath) {
                store.mutations.setRepoPath(repoPath);
                document.title = repoPath ? `Inazuma (${repoPath})` : "Inazuma";
                if (repoPath) {
                    const { commits, refs } = await browserCommand.openRepository(repoPath);
                    store.actions.showCommits(commits, refs);
                }
            }
        }
    },
    render(h) {
        return h("router-view");
    }
});
