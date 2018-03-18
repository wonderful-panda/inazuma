import Vue, { VueConstructor } from "vue";
import * as sinai from "sinai";
import * as tsx from "vue-tsx-support";
import * as Electron from "electron";
import { AppState, LogItem } from "../mainTypes";
import { navigate } from "../route";
import { GraphFragment, Grapher } from "core/grapher";
import { browserCommand } from "core/browser";
import { dialogModule } from "view/common/storeModules/dialog";

const { BrowserWindow, dialog } = Electron.remote;

const emptyCommit: CommitDetail = {
  id: "",
  summary: "",
  author: "",
  parentIds: [],
  body: "",
  date: 0,
  files: []
};

const injected = sinai.inject("dialog", dialogModule);

class State implements AppState {
  environment = Electron.remote.getGlobal("environment") as Environment;
  config = Electron.remote.getGlobal("config") as Config;
  repoPath = "";
  commits = [] as Commit[];
  graphs = {} as Dict<GraphFragment>;
  refs = {} as Refs;
  selectedIndex = -1;
  selectedCommit = emptyCommit;
  rowHeight = 24;
  sidebar = "";
}

class Mutations extends injected.Mutations<State>() {
  resetItems(commits: Commit[], graphs: Dict<GraphFragment>, refs: Refs) {
    const state = this.state;
    state.commits = commits;
    state.graphs = graphs;
    state.refs = refs;
    state.selectedIndex = -1;
    state.selectedCommit = emptyCommit;
  }

  resetRefs(refs: Refs) {
    this.state.refs = refs;
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
    state.commits = [];
    state.graphs = {};
    state.graphs = {};
    state.selectedIndex = -1;
    state.selectedCommit = emptyCommit;
  }

  setSelectedIndex(index: number) {
    const state = this.state;
    state.selectedIndex = index;
    state.selectedCommit = emptyCommit;
  }

  setCommitDetail(commit: CommitDetail) {
    const { commits, selectedIndex } = this.state;
    if (commits[selectedIndex].id === commit.id) {
      this.state.selectedCommit = commit;
    }
  }

  setSidebarName(name: string) {
    this.state.sidebar = name;
  }
}

class Getters extends injected.Getters<State>() {
  get items(): LogItem[] {
    const { commits, graphs, refs } = this.state;
    return commits.map(commit => {
      const graph = graphs[commit.id];
      const { refsById } = refs;
      const refsOfThis = (refsById[commit.id] || []).filter(
        r => r.type !== "MERGE_HEAD"
      );
      return { commit, graph, refs: refsOfThis };
    });
  }
}

class Actions extends injected.Actions<State, Getters, Mutations>() {
  error(e: Error) {
    // eslint-disable-next-line no-console
    console.log(e);
  }

  environmentChanged(env: Environment) {
    this.mutations.resetEnvironment(env);
  }

  configChanged(config: Config) {
    this.mutations.resetConfig(config);
  }

  showRepositorySelectDialog() {
    const paths = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      properties: ["openDirectory"]
    });
    if (typeof paths === "undefined") {
      return;
    }
    const repoPath = paths[0].replace(/\\/g, "/").replace(/\/$/, "");
    navigate.log(repoPath);
  }

  navigateToLog(repoPath: string) {
    navigate.log(repoPath);
  }

  navigateToRoot() {
    navigate.root();
  }

  showCommits(commits: Commit[], refs: Refs) {
    const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
    const graphs = {} as { [id: string]: GraphFragment };
    commits.forEach(c => {
      graphs[c.id] = grapher.proceed(c);
    });
    this.mutations.resetItems(commits, graphs, refs);
  }

  showCommitDetail(commit: CommitDetail) {
    this.mutations.setCommitDetail(commit);
  }

  async setSelectedIndex(index: number): Promise<void> {
    if (this.state.selectedIndex === index) {
      return;
    }
    this.mutations.setSelectedIndex(index);
    const { repoPath, commits } = this.state;
    const detail = await browserCommand.getCommitDetail({
      repoPath,
      sha: commits[index].id
    });
    this.showCommitDetail(detail);
  }

  selectCommit(commitId: string): Promise<void> {
    const index = this.state.commits.findIndex(c => c.id === commitId);
    if (0 <= index) {
      return this.setSelectedIndex(index);
    } else {
      return Promise.resolve();
    }
  }

  showSidebar(name: string) {
    this.mutations.setSidebarName(name);
  }

  hideSidebar() {
    this.mutations.setSidebarName("");
  }

  resetConfig(config: Config): Promise<void> {
    return browserCommand.resetConfig(config);
  }

  runInteractiveShell(): Promise<void> {
    return browserCommand.runInteractiveShell(this.state.repoPath);
  }

  async showVersionDialog(): Promise<boolean> {
    const ret = await this.modules.dialog.actions.show({
      title: "Version",
      renderContent: _h => "Version dialog: Not implemented",
      buttons: []
    });
    return ret.accepted;
  }

  async showExternalDiff(left: DiffFile, right: DiffFile): Promise<void> {
    if (!this.state.config.externalDiffTool) {
      return;
    }
    return browserCommand.showExternalDiff({
      repoPath: this.state.repoPath,
      left,
      right
    });
  }
}

export const store = sinai.store(
  sinai
    .module({
      state: State,
      mutations: Mutations,
      getters: Getters,
      actions: Actions
    })
    .child("dialog", dialogModule)
);

export type AppStore = typeof store;
export const VueWithStore: VueConstructor<
  Vue & { $store: AppStore }
> = Vue as any;
export const componentWithStore = tsx.extendFrom(VueWithStore).create;
