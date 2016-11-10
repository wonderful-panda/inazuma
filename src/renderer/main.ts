import * as Vue from "vue";
import * as VueRouter from "vue-router";
import * as Electron from "electron";
import { component, watch } from "vueit";
import { store } from "./store";
import { router } from "./route";
import { browserActions } from "./browserActions";
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
            const route: VueRouter.Route = this.$route;
            if (route.name === "log") {
                const repoPath = decodeURIComponent(route.params["repoPath"]);
                this.$store.commit("setRepoPath", repoPath);
                browserActions.openRepository(null, repoPath);
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

