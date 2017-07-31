import Vue from "vue";
import component from "vue-class-component";
import * as vtable from "view/common/components/vtable";
import { AppStore } from "../store";
import { LogItem } from "../mainTypes";
import { dragdrop } from "../dragdrop";

const Vtable = vtable.of<LogItem>();

@component<LogView>({
    render(h) {
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
                />;
    }
})
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
}
