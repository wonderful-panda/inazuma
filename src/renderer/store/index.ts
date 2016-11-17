///<reference path="../rendererTypes.d.ts" />
import * as Vue from "vue";
import * as Vuex from "vuex";
import * as Electron from "electron";
import { AppState, LogItem } from "../rendererTypes";
import actions from "./actions";
import * as columns from "./logColumns";

const emptyCommit: CommitDetail = {
    id: "",
    summary: "",
    author: "",
    parentIds: [],
    body: "",
    date: 0,
    files: []
}

Vue.use(Vuex);
export const store = new Vuex.Store<AppState>({
    state: {
        environment: <Environment>Electron.remote.getGlobal("environment"),
        columns: columns.detail,
        repoPath: "",
        items: [],
        selectedIndex: -1,
        selectedCommit: emptyCommit,
        rowHeight: 24
    },
    mutations: {
        resetItems(state: AppState, items: LogItem[]) {
            state.items = items;
            state.selectedIndex = -1;
            state.selectedCommit = emptyCommit;
        },
        resetEnvironment(state: AppState, env: Environment) {
            state.environment = env;
        },
        setRepoPath(state: AppState, repoPath: string) {
            state.repoPath = repoPath;
            state.items = [];
            state.selectedIndex = -1;
            state.selectedCommit = emptyCommit;
        },
        setSelectedIndex(state: AppState, index: number) {
            state.selectedIndex = index;
            state.selectedCommit = emptyCommit;
        },
        setCommitDetail(state: AppState, commit: CommitDetail) {
            const { items, selectedIndex } = state;
            if (items[selectedIndex].commit.id === commit.id) {
                state.selectedCommit = commit;
            }
        }
    },
    actions
});

