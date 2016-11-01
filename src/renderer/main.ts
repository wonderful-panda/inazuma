import * as Vue from "vue";
import * as VueRouter from "vue-router";
import * as Electron from "electron";
import { component, watch } from "vueit";
import { store } from "./store";
import { router } from "./route";
import { browserActions } from "./browserActions";
const { render, staticRenderFns } = require("./app.pug");

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
                browserActions.openRepository(null, route.params["repoPath"]);
            }
        }
    },
    created() {
        (this as any).onRouteChanged();
    },
    watch: {
        "$route": "onRouteChanged"
    }
});

