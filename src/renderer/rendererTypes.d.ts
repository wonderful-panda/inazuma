import * as Vuex from "vuex";
import { GraphFragment } from "./grapher";
import { VtableColumn } from "vue-vtable";

export interface LogItem {
    graph: GraphFragment;
    commit: Commit;
}

export interface AppState {
    repoPath: string;
    environment: Environment,
    columns: VtableColumn[];
    items: LogItem[];
    rowHeight: number;
}

export type AppActionTree = Vuex.ActionTree<AppState, AppState>;
export type AppActionContext = Vuex.ActionContext<AppState, AppState>;

