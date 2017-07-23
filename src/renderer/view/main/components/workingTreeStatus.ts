import Vue from "vue";
import component from "vue-class-component";
import { Vtable, VtableColumn } from "vue-vtable";
import { AppStore } from "../store";

const fileColumns: VtableColumn<FileEntry>[] = [
    {
        title: "",
        className: "cell-stat",
        defaultWidth: 24,
        minWidth: 24,
        render: (h, item, index, ctx) => item.statusCode
    },
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
}
