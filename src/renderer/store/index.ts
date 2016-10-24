import * as Vue from "vue";
import * as Vuex from "vuex";
import * as _ from "lodash";
import { VtableColumn } from "vue-vtable";
import { GraphCell, GraphCellProps } from "../components/graphCell";

Vue.use(Vuex);

export interface AppState {
    columns: VtableColumn[];
    items: number[];
    rowHeight: number;
}

export type AppStore = Vuex.Store<AppState>;

const graphCellEven: GraphCellProps = {
    gridWidth: 16,
    height: 24,
    graph: {
        interEdges: [
            { index: 2, type: "I", color: "yellow" }
        ],
        nodeEdges: [
            { index: 0, type: "C", color: "orange" },
            { index: 0, type: "P", color: "orange" },
            { index: 1, type: "C", color: "cyan" },
            { index: 1, type: "P", color: "cyan" }
        ],
        node: {
            index: 0,
            color: "orange"
        },
        width: 3
    }
};

const graphCellOdd: GraphCellProps = {
    gridWidth: 16,
    height: 24,
    graph: {
        interEdges: [
            { index: 1, type: "I", color: "cyan" }
        ],
        nodeEdges: [
            { index: 0, type: "C", color: "orange" },
            { index: 0, type: "P", color: "orange" },
            { index: 2, type: "C", color: "yellow" },
            { index: 2, type: "P", color: "yellow" }
        ],
        node: {
            index: 0,
            color: "orange"
        },
        width: 3
    }
};


const detailColumns: VtableColumn[] = [
    {
        title: "graph",
        className: "cell-graph",
        defaultWidth: 120,
        minWidth: 80,
        render: (h, item, index, ctx) => {
            const props = index % 2 ? graphCellOdd : graphCellEven;
            return h(GraphCell, { props });
        }
    },
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
        rowHeight: 24
    }
});
