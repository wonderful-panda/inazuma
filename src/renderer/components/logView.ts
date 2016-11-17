import * as Vue from "vue";
import * as Vuex from "vuex";
import { component } from "vueit";
import { Vtable, VtableProps } from "vue-vtable";
import { store } from "../store";
import { LogItem, AppState } from "../rendererTypes";

@component<LogView>({
    components: { Vtable },
    store,
    render(h) {
        const { items, columns, rowHeight, selectedIndex } = this.$store.state;
        const props: VtableProps<LogItem> = {
            items,
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
                this.$store.dispatch("setSelectedIndex", index);
            }
        };
        const attrs = {
            id: "main-revision-log"
        };
        return h(Vtable, { attrs, props, on });
    }
})
export class LogView extends Vue {
    $store: Vuex.Store<AppState>;
}
