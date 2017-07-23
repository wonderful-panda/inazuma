import Vue from "vue";
import component from "vue-class-component";
import { Vtable, VtableProps } from "vue-vtable";
import { AppStore } from "../store";
import { LogItem } from "../mainTypes";

@component<LogView>({
    components: { Vtable },
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
}
