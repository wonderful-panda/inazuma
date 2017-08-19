import Vue from "vue";
import component from "vue-class-component";
import * as vtable from "view/common/components/vtable";
import { AppStore } from "../store";
import { LogItem } from "../mainTypes";

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
                    onRowclick={ args => this.$store.actions.setSelectedIndex(args.index) }
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
}
