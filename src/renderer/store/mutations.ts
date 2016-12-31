import * as Vue from "vue";
import { AppState, LogItem, MutationPayload } from "../rendererTypes";

const emptyCommit: CommitDetail = {
    id: "",
    summary: "",
    author: "",
    parentIds: [],
    body: "",
    date: 0,
    files: []
};

type MutationHandler<K extends keyof MutationPayload> = (state: AppState, payload: MutationPayload[K]) => void;
type Mutations = { [K in keyof MutationPayload]: MutationHandler<K> };

const mutations: Mutations = {
    resetItems: (state, items) => {
        state.items = items;
        state.selectedIndex = -1;
        state.selectedCommit = emptyCommit;
    },
    resetEnvironment(state, env) {
        state.environment = env;
    },
    setRepoPath(state, repoPath) {
        state.repoPath = repoPath;
        state.items = [];
        state.selectedIndex = -1;
        state.selectedCommit = emptyCommit;
    },
    setSelectedIndex(state, index) {
        state.selectedIndex = index;
        state.selectedCommit = emptyCommit;
    },
    setCommitDetail(state, commit) {
        const { items, selectedIndex } = state;
        if (items[selectedIndex].commit.id === commit.id) {
            state.selectedCommit = commit;
        }
    }
};

export default mutations;
