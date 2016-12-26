import * as Vue from "vue";
import * as VueRouter from "vue-router";
import { component } from "vueit";
import { store } from "../store";
import { AppStore } from "../rendererTypes";
import { LogView } from "./logView";
import { SplitterPanel } from "./splitterPanel";
import { CommitDetail } from "./commitDetail";
import { getFileName } from "../utils";

@component<MainWindow>({
    components: { LogView, CommitDetail, SplitterPanel },
    compiledTemplate: require("./mainWindow.pug"),
    store
})
export class MainWindow extends Vue {
    $store: AppStore;
    get repoPath () {
        return this.$store.state.repoPath;
    }
    get repoPathEncoded() {
        return encodeURIComponent(this.repoPath);
    }
    get repoName() {
        return getFileName(this.repoPath);
    }
    reload() {
        location.reload();
    }
}
