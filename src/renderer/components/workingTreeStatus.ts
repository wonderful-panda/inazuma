import Vue from "vue";
import component from "vue-class-component";
import { Vtable, VtableColumn } from "vue-vtable";
import { store } from "../store";
import { AppStore } from "../rendererTypes";
import { formatDate } from "../utils";

const fileColumns: VtableColumn<FileEntry>[] = [
    {
        title: "path",
        className: "cell-path",
        defaultWidth: 200,
        minWidth: 100,
        render: (h, item, index, ctx) => item.path
    }
];

@component<WorkingTreeStatus>({
    ...<CompiledTemplate>require("./workingTreeStatus.pug"),
    components: { Vtable },
    store
})
export class WorkingTreeStatus extends Vue {
    $store: AppStore;
    get commit() {
        return this.$store.state.selectedCommit;
    }
    get fileColumns() {
        return fileColumns;
    }
    get stagedFiles() {
        return this.$store.state.selectedCommit.files.filter(f => {
            return f.inIndex;
        });
    }
    get unstagedFiles() {
        return this.$store.state.selectedCommit.files.filter(f => {
            return f.inWorkingTree;
        });
    }
    getFileKey(item: FileEntry) {
        return item.path;
    }
}
