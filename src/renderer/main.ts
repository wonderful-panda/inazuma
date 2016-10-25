import * as Vue from "vue";
import { component } from "vueit";
import { Vtable, VtableProps } from "vue-vtable";
import { store, AppStore, LogItem } from "./store";

@component<App>({
    store,
    created() {
        console.log("created");
    },
    render(h: typeof Vue.prototype.$createElement) {
        const { items, columns, rowHeight } = this.$store.state;
        const props: VtableProps = {
            items,
            columns,
            rowHeight,
            rowStyleCycle: 2,
            getItemKey: (item: LogItem) => item.commit.id
        };
        return h(Vtable, {
            props,
            staticClass: "revision-list",
            domProps: { id: "main-revision-list" }
        });
    }
})
export class App extends Vue {
    $store: AppStore;
}

new Vue({
    el: "#app",
    render(h) {
        return h(App);
    }
});
