import Vue from "vue";
import Vuex from "vuex";
import VueRouter from "vue-router";
Vue.use(Vuex);
Vue.use(VueRouter);
import * as Electron from "electron";
import { store } from "./store";
import { AppStore } from "./mainTypes";
import { router } from "./route";
import { browserCommand } from "core/browser";
const { render, staticRenderFns } = require("./app.pug");

import "../common/components/index";

Electron.ipcRenderer.on("action", (event, name, payload) => {
    store.dispatch(name, payload);
});

const app = new Vue({
    el: "#app",
    store,
    router,
    render,
    staticRenderFns,
    methods: {
        async onRouteChanged() {
            const store = <AppStore>this.$store;
            const route: VueRouter.Route = this.$route;
            const { repoPathEncoded } = route.params;
            const repoPath = repoPathEncoded ? decodeURIComponent(repoPathEncoded) : undefined;
            if (store.state.repoPath !== repoPath) {
                store.commit("setRepoPath", repoPath);
                document.title = repoPath ? `Inazuma (${ repoPath })` : "Inazuma";
                if (repoPath) {
                    const commits = await browserCommand.openRepository(repoPath);
                    store.dispatch("showCommits", commits);
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

