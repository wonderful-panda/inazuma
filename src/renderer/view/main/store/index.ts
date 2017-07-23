import Vue from "vue";
import * as sinai from "sinai";
import * as Electron from "electron";
import { AppState, LogItem } from "../mainTypes";
import * as columns from "./logColumns";
import { navigate } from "../route";
import { Grapher } from "core/grapher";
const { BrowserWindow, dialog } = Electron.remote;
import { browserCommand } from "core/browser";

const emptyCommit: CommitDetail = {
    id: "",
    summary: "",
    author: "",
    parentIds: [],
    body: "",
    date: 0,
    files: []
};

class State implements AppState {
    environment = <Environment>Electron.remote.getGlobal("environment");
    config = <Config>Electron.remote.getGlobal("config");
    columns = columns.detail;
    repoPath = "";
    items = [];
    selectedIndex = -1;
    selectedCommit = emptyCommit;
    rowHeight = 24;
    sidebar = "";
}

class Mutations extends sinai.Mutations<State>() {
    resetItems(items: LogItem[]) {
        const state = this.state;
        state.items = items;
        state.selectedIndex = -1;
        state.selectedCommit = emptyCommit;
    }

    resetEnvironment(env: Environment) {
        this.state.environment = env;
    }

    resetConfig(config: Config) {
        this.state.config = config;
    }

    setRepoPath(repoPath: string) {
        const state = this.state;
        state.repoPath = repoPath;
        state.items = [];
        state.selectedIndex = -1;
        state.selectedCommit = emptyCommit;
    }

    setSelectedIndex(index: number) {
        const state = this.state;
        state.selectedIndex = index;
        state.selectedCommit = emptyCommit;
    }

    setCommitDetail(commit: CommitDetail) {
        const { items, selectedIndex } = this.state;
        if (items[selectedIndex].commit.id === commit.id) {
            this.state.selectedCommit = commit;
        }
    }

    setSidebarName(name: string) {
        this.state.sidebar = name;
    }
}

class Actions extends sinai.Actions<State, any, Mutations>() {
    error(e) {
        // TODO
        console.log(e);
    }

    environmentChanged(env: Environment) {
        this.mutations.resetEnvironment(env);
    }

    configChanged(config: Config) {
        this.mutations.resetConfig(config);
    }

    showRepositorySelectDialog() {
        const paths = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {properties: ["openDirectory"]});
        if (typeof paths === "undefined") {
            return;
        }
        const repoPath = paths[0].replace(/\\/g, "/").replace(/\/$/, "");
        navigate.log(repoPath);
    }

    navigateToLog(repoPath) {
        navigate.log(repoPath);
    }

    navigateToRoot() {
        navigate.root();
    }

    showCommits(commits: Commit[]) {
        const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
        const logItems: LogItem[] = commits.map(c => {
            return { commit: c, graph: grapher.proceed(c) };
        });
        this.mutations.resetItems(logItems);
    }

    showCommitDetail(commit: CommitDetail) {
        this.mutations.setCommitDetail(commit);
    }

    async setSelectedIndex(index: number): Promise<undefined> {
        if (this.state.selectedIndex === index) {
            return;
        }
        this.mutations.setSelectedIndex(index);
        const { repoPath, items } = this.state;
        const detail = await browserCommand.getCommitDetail({ repoPath, sha: items[index].commit.id });
        this.showCommitDetail(detail);
        return;
    }

    showSidebar(name: string) {
        this.mutations.setSidebarName(name);
    }

    hideSidebar() {
        this.mutations.setSidebarName("");
    }

    async resetConfig(config: Config): Promise<undefined> {
        await browserCommand.resetConfig(config);
        return;
    }

    async runInteractiveShell(): Promise<undefined> {
        await browserCommand.runInteractiveShell(this.state.repoPath);
        return;
    }
}

export const store = sinai.store(
    sinai.module({
        state: State,
        mutations: Mutations,
        actions: Actions
    })
);

export type AppStore = typeof store;
