import * as Vue from "vue";
import * as Vuex from "vuex";
import { component } from "vueit";
import { Vtable } from "vue-vtable";
import { store } from "../store";
import { LogItem, AppState } from "../rendererTypes";

@component<LogView>({
    components: { Vtable },
    compiledTemplate: require("./logView.pug"),
    store
})
export class LogView extends Vue {
    $store: Vuex.Store<AppState>;
    get items() {
        return this.$store.state.items;
    }
    get columns() {
        return this.$store.state.columns;
    }
    get rowHeight() {
        return this.$store.state.rowHeight;
    }
    getItemKey(item: LogItem) {
        return item.commit.id;
    }
}
