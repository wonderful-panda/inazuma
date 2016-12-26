import * as Vue from "vue";
import * as Vuex from "vuex";
import * as VueRouter from "vue-router";
Vue.use(Vuex);
Vue.use(VueRouter);
import * as Electron from "electron";
import { store } from "./store";
import { AppStore } from "./rendererTypes";
import { router } from "./route";
import { dispatchBrowser } from "./browser";
const { render, staticRenderFns } = require("./app.pug");

import "./components/global/index";

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

