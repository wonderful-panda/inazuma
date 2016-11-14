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
        const { items, columns, rowHeight } = this.$store.state;
        const props: VtableProps<LogItem> = {
            items,
            columns,
            rowHeight,
            rowStyleCycle: 2,
            getItemKey: item => item.commit.id
        };
        return h(Vtable, { props });
    }
})
export class LogView extends Vue {
    $store: Vuex.Store<AppState>;
}
