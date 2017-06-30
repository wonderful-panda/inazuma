import Vue from "vue";
import Vuex from "vuex";
import * as Electron from "electron";
import { AppState, LogItem } from "../mainTypes";
import mutations from "./mutations";
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
};

export const store = new Vuex.Store<AppState>({
    state: {
        environment: <Environment>Electron.remote.getGlobal("environment"),
        config: <Config>Electron.remote.getGlobal("config"),
        columns: columns.detail,
        repoPath: "",
        items: [],
        selectedIndex: -1,
        selectedCommit: emptyCommit,
        rowHeight: 24,
        sidebar: ""
    },
    mutations,
    actions
});

