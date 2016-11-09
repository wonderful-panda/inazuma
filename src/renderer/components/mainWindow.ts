import * as Vue from "vue";
import * as Vuex from "vuex";
import { component } from "vueit";
import { store } from "../store";
import { AppState } from "../rendererTypes";
import { LogView } from "./logView";
import { getRepoName } from "../utils";

@component<MainWindow>({
    components: { LogView },
    compiledTemplate: require("./mainWindow.pug"),
    store,
    created() {
        Vue.nextTick(() => {
            componentHandler.upgradeElement(this.$el);
        });
    }
})
export class MainWindow extends Vue {
    $store: Vuex.Store<AppState>;
    get repoPath () {
        return this.$store.state.repoPath;
    }
    get branchesLocation() {
        return { name: "branches", params: { repoPath: encodeURIComponent(this.repoPath) } };
    }
    get repoName() {
        const { repoPath } = this.$store.state;
        return getRepoName(repoPath);
    }
}
