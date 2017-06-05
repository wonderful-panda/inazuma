import Vue from "vue";
import Vuex from "vuex";
import VueRouter from "vue-router";
Vue.use(Vuex);
Vue.use(VueRouter);
import * as Electron from "electron";
import { store } from "./store";
import { AppStore } from "./mainTypes";
import { router } from "./route";
import { dispatchBrowser } from "core/browser";
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
        onRouteChanged() {
            const store = <AppStore>this.$store;
            const route: VueRouter.Route = this.$route;
            const { repoPathEncoded } = route.params;
            const repoPath = repoPathEncoded ? decodeURIComponent(repoPathEncoded) : undefined;
            if (store.state.repoPath !== repoPath) {
                store.commit("setRepoPath", repoPath);
                if (repoPath) {
                    dispatchBrowser("openRepository", repoPath);
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

