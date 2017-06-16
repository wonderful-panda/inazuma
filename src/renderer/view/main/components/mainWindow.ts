import Vue from "vue";
import component from "vue-class-component";
import { store } from "../store";
import { AppStore } from "../mainTypes";
import { MainLayout } from "./mainLayout";
import { LogView } from "./logView";
import { SplitterPanel } from "./splitterPanel";
import { DetailPanel } from "./detailPanel";
import { getFileName } from "core/utils";

@component<MainWindow>({
    components: { MainLayout, LogView, SplitterPanel, DetailPanel },
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
