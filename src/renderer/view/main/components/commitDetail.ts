import Vue from "vue";
import component from "vue-class-component";
import { Vtable, VtableColumn } from "vue-vtable";
import { store } from "../store";
import { AppStore } from "../mainTypes";
import { formatDate } from "core/utils";

const fileColumns: VtableColumn<CommitEntry>[] = [
    {
        title: "path",
        className: "cell-path",
        defaultWidth: 200,
        minWidth: 100,
        render: (h, item, index, ctx) => item.path
    }
];

@component<CommitDetail>({
    ...<CompiledTemplate>require("./commitDetail.pug"),
    components: { Vtable },
    store
})
export class CommitDetail extends Vue {
    $store: AppStore;
    get commit() {
        return this.$store.state.selectedCommit;
    }
    get commitDate() {
        return formatDate(new Date(this.commit.date));
    }
    get fileColumns() {
        return fileColumns;
    }
    getFileKey(item: CommitEntry) {
        return item.path;
    }
}
