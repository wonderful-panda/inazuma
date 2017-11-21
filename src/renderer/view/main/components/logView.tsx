import Vue, { VNode } from "vue";
import component from "vue-class-component";
import * as moment from "moment";
import { AppStore } from "../store";
import { vtableOf } from "vue-vtable";
import { GraphCell } from "../components/graphCell";
import { SummaryCell } from "../components/summaryCell";
import { LogItem } from "../mainTypes";
import { dragdrop } from "../dragdrop";

const Vtable = vtableOf<LogItem>();

@component
export class LogView extends Vue {
    $store: AppStore;

    get items(): LogItem[] {
        const state = this.$store.state;
        return state.commits.map(commit => {
            const graph = state.graphs[commit.id]
            const refs = (state.refs[commit.id] || []).filter(r => r.type !== "MERGE_HEAD");
            return { commit, graph, refs };
        });
    }

    onRowdragover(item: LogItem, event: DragEvent) {
        if (item.commit.id === "--") {
            return;
        }
        if (dragdrop.isDataPresent(event, "git/branch")) {
            event.dataTransfer.dropEffect = "move";
            event.preventDefault();
        }
    }

    onRowdrop(item: LogItem, event: DragEvent) {
        if (item.commit.id === "--") {
            return;
        }
        const data = dragdrop.getData(event, "git/branch");
        console.log("drop", data);
    }

    renderCell(columnId: string, item: LogItem): VNode | string {
        switch (columnId) {
            case "graph":
                return <GraphCell graph={item.graph} gridWidth={12} height={24} />;
            case "id":
                return item.commit.id.substring(0, 8);
            case "author":
                return item.commit.author;
            case "date":
                return moment(item.commit.date).local().format("L");
            case "comment":
                return <SummaryCell commit={item.commit} refs={item.refs} />;
            default:
                return "";
        }
    }

    render(): VNode {
        const { columns, rowHeight, selectedIndex } = this.$store.state;
        return <Vtable
                    id="main-revision-log"
                    items={ this.items } columns={ columns } rowHeight={ rowHeight }
                    rowStyleCycle={ 2 }
                    getItemKey={ item => item.commit.id }
                    getRowClass={ (item, index) => index === selectedIndex ? "vtable-row-selected" : "vtable-row" }
                    onRowclick={ arg => this.$store.actions.setSelectedIndex(arg.index) }
                    onRowdragover={ arg => this.onRowdragover(arg.item, arg.event) }
                    onRowdrop={ arg => this.onRowdrop(arg.item, arg.event) }
                    scopedSlots={{
                        cell: p => [this.renderCell(p.columnId, p.item)]
                    }}
                />;
    }

}
