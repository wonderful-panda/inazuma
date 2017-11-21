import Vue from "vue";
import component from "vue-class-component";
import { Vtable, VtableColumn } from "vue-vtable";
import { AppStore } from "../store";

const fileColumns: VtableColumn[] = [
    {
        title: "",
        className: "cell-stat",
        defaultWidth: 24,
        minWidth: 24
    },
    {
        title: "path",
        className: "cell-path",
        defaultWidth: 200,
        minWidth: 100
    }
];

@component<WorkingTreeStatus>({
    ...<CompiledTemplate>require("./workingTreeStatus.pug"),
    components: { Vtable }
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

    renderCell(columnId: string, item: FileEntry) {
        if (columnId === "path") {
            return item.path;
        }
        else {
            return item.statusCode;
        }
    }
}
