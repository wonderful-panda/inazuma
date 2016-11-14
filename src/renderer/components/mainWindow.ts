import * as Vue from "vue";
import * as Vuex from "vuex";
import * as VueRouter from "vue-router";
import { component } from "vueit";
import { store } from "../store";
import { AppState } from "../rendererTypes";
import { LogView } from "./logView";
import { getFileName } from "../utils";

@component<MainWindow>({
    components: { LogView },
    compiledTemplate: require("./mainWindow.pug"),
    store
})
export class MainWindow extends Vue {
    $route: VueRouter.Route;
    $store: Vuex.Store<AppState>;
    get repoPath () {
        return this.$store.state.repoPath;
    }
    get repoPathEncoded() {
        return encodeURIComponent(this.repoPath);
    }
    get navigations() {
        const params = this.$route.params;
        return [
            { name: "branches", params, text: "Branches & Tags", icon: "local_offer" },
            { name: "remotes", params, text: "Remotes", icon: "cloud" },
            { name: "root", text: "Back to Home", icon: "home" },
            { name: "root", text: "Preferences", icon: "settings" },
        ]
    }
    get repoName() {
        return getFileName(this.repoPath);
    }
    reload() {
        location.reload();
    }
}
