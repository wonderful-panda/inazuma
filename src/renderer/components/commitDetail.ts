import * as Vue from "vue";
import * as Vuex from "vuex";
import { component } from "vueit";
import { Vtable, VtableColumn } from "vue-vtable";
import { store } from "../store";
import { AppState } from "../rendererTypes";
import { formatDate } from "../utils";

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
    compiledTemplate: require("./commitDetail.pug"),
    components: { Vtable },
    store
})
export class CommitDetail extends Vue {
    $store: Vuex.Store<AppState>;
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
