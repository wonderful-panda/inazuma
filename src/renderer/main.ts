import * as Vue from "vue";
import * as VueRouter from "vue-router";
import { component, watch } from "vueit";
import { store } from "./store";
import { router } from "./route";
import { Grapher } from "../grapher";
import * as Electron from "electron";

const ipcRenderer = Electron.ipcRenderer;

const app = new Vue({
    el: "#app",
    store,
    router,
    render(h) {
        return h(this.$options.components["router-view"]);
    },
    methods: {
        onRouteChanged() {
            const route: VueRouter.Route = this.$route;
            if (route.name === "log") {
                ipcRenderer.send("openRepository", route.params["repoPath"]);
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

ipcRenderer.on("navigate", (event, option: any) => {
    router.push(option);
});

ipcRenderer.on("COMMITS", (event, commits: Commit[]) => {
    const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
    const logItems = commits.map(c => {
        return { commit: c, graph: grapher.proceed(c) };
    });
    store.commit("resetItems", logItems);
});
