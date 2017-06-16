import Vue from "vue";
import component from "vue-class-component";
import * as moment from "moment";
import { Vtable, VtableColumn } from "vue-vtable";
import { store } from "../store";
import { AppStore } from "../mainTypes";

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
    get className() {
        return (this.commit.id ? undefined : "commit-detail-inactive");
    }
    get commitSummary() {
        return this.commit.summary || "No commit selected"
    }
    get commitDate() {
        if (this.commit.id) {
            return moment(this.commit.date).local().format("llll");
        }
        else {
            return "";
        }
    }
    get fileColumns() {
        return fileColumns;
    }
    getFileKey(item: FileEntry) {
        return item.path;
    }
}
