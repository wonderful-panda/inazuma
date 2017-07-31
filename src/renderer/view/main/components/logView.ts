import Vue from "vue";
import component from "vue-class-component";
import { Vtable, VtableProps } from "vue-vtable";
import { AppStore } from "../store";
import { LogItem } from "../mainTypes";

@component<LogView>({
    components: { Vtable },
    render(h) {
        const { columns, rowHeight, selectedIndex } = this.$store.state;
        const props: Partial<VtableProps<LogItem>> = {
            items: this.items,
            columns,
            rowHeight,
            rowStyleCycle: 2,
            getItemKey: item => item.commit.id,
            getRowClass(item, index) {
                return index === selectedIndex ? "vtable-row-selected" : "vtable-row";
            }
        };
        const on = {
            "row-click": ({item, index}) => {
                this.$store.actions.setSelectedIndex(index);
            }
        };
        const attrs = {
            id: "main-revision-log"
        };
        return h(Vtable, { attrs, props, on });
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
