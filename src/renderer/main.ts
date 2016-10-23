import * as Vue from "vue";
import { component } from "vueit";
import { Vtable, VtableProps } from "vue-vtable";
import { store, AppStore } from "./store";

console.log(Vtable);

@component<App>({
    store,
    render(h: typeof Vue.prototype.$createElement) {
        const { items, columns, rowHeight } = this.$store.state;
        const props: VtableProps = {
            items,
            columns,
            rowHeight,
            rowStyleCycle: 2,
            getItemKey: (item: number) => item
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
