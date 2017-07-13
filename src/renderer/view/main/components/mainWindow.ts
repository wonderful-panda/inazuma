import Vue from "vue";
import component from "vue-class-component";
import { store } from "../store";
import { AppStore } from "../mainTypes";
import { MainLayout } from "./mainLayout";
import { NavigationLink } from "./navigationLink";
import { BranchesBar, RemotesBar } from "./sidebar";
import { LogView } from "./logView";
import { DetailPanel } from "./detailPanel";
import { getFileName } from "core/utils";

@component<MainWindow>({
    components: { MainLayout, NavigationLink, LogView, DetailPanel, BranchesBar, RemotesBar },
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
    get sidebar() {
        switch (this.$store.state.sidebar) {
            case "branches":
                return BranchesBar;
            case "remotes":
                return RemotesBar;
            default:
                return undefined;
        }
    }
    reload() {
        location.reload();
    }
    runInteractiveShell() {
        this.$store.dispatch("runInteractiveShell", null);
    }
}
