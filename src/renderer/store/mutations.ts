import * as Vue from "vue";
import * as Vuex from "vuex";
import { AppState, LogItem, MutationPayload } from "../rendererTypes";

const emptyCommit: CommitDetail = {
    id: "",
    summary: "",
    author: "",
    parentIds: [],
    body: "",
    date: 0,
    files: []
}

const mutations: any = {};

function register(type: keyof MutationPayload, handler: never): void;
function register<K extends keyof MutationPayload>(type: K, handler: (state: AppState, payload: MutationPayload[K]) => any): void;
function register(type, handler) {
    mutations[type] = handler;
}

register("resetItems", (state, items) => {
    state.items = items;
    state.selectedIndex = -1;
    state.selectedCommit = emptyCommit;
});

register("resetEnvironment", (state, env) => {
    state.environment = env;
});

register("setRepoPath", (state, repoPath) => {
    state.repoPath = repoPath;
    state.items = [];
    state.selectedIndex = -1;
    state.selectedCommit = emptyCommit;
});

register("setSelectedIndex", (state, index) => {
    state.selectedIndex = index;
    state.selectedCommit = emptyCommit;
});

register("setCommitDetail", (state, commit) => {
    const { items, selectedIndex } = state;
    if (items[selectedIndex].commit.id === commit.id) {
        state.selectedCommit = commit;
    }
});

export default mutations;
