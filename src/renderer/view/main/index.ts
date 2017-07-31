import Vue from "vue";
import * as sinai from "sinai";
import VueRouter from "vue-router";
Vue.use(sinai.install);
Vue.use(VueRouter);
import * as Electron from "electron";
import { store, AppStore } from "./store";
import { router } from "./route";
import { browserCommand } from "core/browser";
const { render, staticRenderFns } = require("./app.pug");

import "../common/components/index";

Electron.ipcRenderer.on("action", (event, name, payload) => {
    store.actions[name](payload);
});

const app = new Vue({
    el: "#app",
    store,
    router,
    render,
    staticRenderFns,
    methods: {
        async onRouteChanged() {
            const route: VueRouter.Route = this.$route;
            const { repoPathEncoded } = route.params;
            const repoPath = repoPathEncoded ? decodeURIComponent(repoPathEncoded) : undefined;
            if (store.state.repoPath !== repoPath) {
                store.mutations.setRepoPath(repoPath);
                document.title = repoPath ? `Inazuma (${ repoPath })` : "Inazuma";
                if (repoPath) {
                    const { commits, refs } = await browserCommand.openRepository(repoPath);
                    store.actions.showCommits(commits, refs);
                }
            }
        }
    },
    created(this: any) {
        this.onRouteChanged();
    },
    watch: {
        "$route": "onRouteChanged"
    }
});

