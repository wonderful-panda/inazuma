///<reference path="../rendererTypes.d.ts" />
import * as Vue from "vue";
import * as Vuex from "vuex";
import * as _ from "lodash";
import * as Electron from "electron";
import { VtableColumn } from "vue-vtable";
import { GraphCell, GraphCellProps } from "../components/graphCell";
import { LogItem, AppState } from "../rendererTypes";
import actions from "./actions";

Vue.use(Vuex);

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
        environment: <Environment>Electron.remote.getGlobal("environment"),
        columns: detailColumns,
        items: [],
        rowHeight: 24
    },
    mutations: {
        resetItems(state: AppState, items: LogItem[]) {
            state.items = items;
        },
        resetEnvironment(state: AppState, env: Environment) {
            state.environment = env;
        }
    },
    actions
});

