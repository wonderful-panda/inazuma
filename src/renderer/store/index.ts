import * as Vue from "vue";
import * as Vuex from "vuex";
import * as _ from "lodash";
import { VtableColumn } from "vue-vtable";

Vue.use(Vuex);

export interface AppState {
    columns: VtableColumn[];
    items: number[];
    rowHeight: number;
}

export type AppStore = Vuex.Store<AppState>;

const detailColumns: VtableColumn[] = [
    {
        title: "id",
        className: "cell-id",
        defaultWidth: 120,
        minWidth: 80,
        render: (h, item, index, ctx) => item
    },
    {
        title: "author",
        className: "cell-author",
        defaultWidth: 200,
        minWidth: 80,
        render: (h, item, index, ctx) => `author of ${item}`
    },
    {
        title: "date",
        className: "cell-date",
        defaultWidth: 200,
        minWidth: 80,
        render: (h, item, index, ctx) => "9999-99-99 99:99:99"
    },
    {
        title: "comment",
        className: "cell-comment",
        defaultWidth: 600,
        minWidth: 200,
        render: (h, item, index, ctx) => "----+----1----+----2----+----3----+----4-----+----5"
    }
];

export const store = new Vuex.Store<AppState>({
    state: {
        columns: detailColumns,
        items: _.range(0, 10000),
        rowHeight: 20
    }
});
