import * as Vue from "vue";
import * as Vuex from "vuex";
import * as _ from "lodash";
import * as Electron from "electron";
import { GraphFragment, Grapher } from "../../grapher";
import { VtableColumn } from "vue-vtable";
import { GraphCell, GraphCellProps } from "../components/graphCell";

const ipcRenderer = Electron.ipcRenderer;

Vue.use(Vuex);

export interface LogItem {
    graph: GraphFragment;
    commit: Commit;
}

export interface AppState {
    columns: VtableColumn[];
    items: LogItem[];
    rowHeight: number;
}

export type AppStore = Vuex.Store<AppState>;

const detailColumns: VtableColumn[] = [
    {
        title: "graph",
        className: "cell-graph",
        defaultWidth: 120,
        minWidth: 40,
        render: (h, item: LogItem, index, ctx) => {
            const props: GraphCellProps = {
                graph: item.graph,
                gridWidth: 16,
                height: 24
            };
            return h(GraphCell, { props });
        }
    },
    {
        title: "id",
        className: "cell-id",
        defaultWidth: 80,
        minWidth: 40,
        render: (h, item: LogItem, index, ctx) => item.commit.id.substring(0, 8)
    },
    {
        title: "author",
        className: "cell-author",
        defaultWidth: 120,
        minWidth: 40,
        render: (h, item: LogItem, index, ctx) => item.commit.author
    },
    {
        title: "date",
        className: "cell-date",
        defaultWidth: 200,
        minWidth: 80,
        render: (h, item: LogItem, index, ctx) => item.commit.date.toLocaleString()
    },
    {
        title: "comment",
        className: "cell-comment",
        defaultWidth: 600,
        minWidth: 200,
        render: (h, item: LogItem, index, ctx) => item.commit.summary
    }
];

export const store = new Vuex.Store<AppState>({
    state: {
        columns: detailColumns,
        items: [],
        rowHeight: 24
    },
    mutations: {
        resetItems(state: AppState, items: LogItem[]) {
            state.items = items;
        }
    }
});

