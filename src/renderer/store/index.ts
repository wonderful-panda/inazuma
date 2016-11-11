///<reference path="../rendererTypes.d.ts" />
import * as Vue from "vue";
import * as Vuex from "vuex";
import * as Electron from "electron";
import { AppState, LogItem } from "../rendererTypes";
import actions from "./actions";
import * as columns from "./logColumns";

Vue.use(Vuex);
export const store = new Vuex.Store<AppState>({
    state: {
        environment: <Environment>Electron.remote.getGlobal("environment"),
        columns: columns.detail,
        repoPath: "",
        items: [],
        rowHeight: 24
    },
    mutations: {
        resetItems(state: AppState, items: LogItem[]) {
            state.items = items;
        },
        resetEnvironment(state: AppState, env: Environment) {
            state.environment = env;
        },
        setRepoPath(state: AppState, repoPath: string) {
            state.repoPath = repoPath;
        }
    },
    actions
});

