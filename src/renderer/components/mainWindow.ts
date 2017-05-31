import Vue from "vue";
import component from "vue-class-component";
import { store } from "../store";
import { AppStore } from "../rendererTypes";
import { LogView } from "./logView";
import { SplitterPanel } from "./splitterPanel";
import { CommitDetail } from "./commitDetail";
import { getFileName } from "../utils";

@component<MainWindow>({
    components: { LogView, CommitDetail, SplitterPanel },
    ...<CompiledTemplate>require("./mainWindow.pug"),
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
