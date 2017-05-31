import Vue from "vue";
import component from "vue-class-component";
import { Vtable, VtableProps } from "vue-vtable";
import { store } from "../store";
import { LogItem, AppStore } from "../rendererTypes";

@component<LogView>({
    components: { Vtable },
    store,
    render(h) {
        const { items, columns, rowHeight, selectedIndex } = this.$store.state;
        const props: Partial<VtableProps<LogItem>> = {
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
    $store: AppStore;
}
