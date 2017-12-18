import Vue, { VueConstructor } from "vue";
import * as sinai from "sinai";
import * as tsx from "vue-tsx-support";
import * as Electron from "electron";
import { AppState } from "../mainTypes";
import * as columns from "./logColumns";
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
  columns = columns.detail;
  repoPath = "";
  commits = [] as Commit[];
  graphs = {} as Dict<GraphFragment>;
  refs = {} as Dict<Ref[]>;
  selectedIndex = -1;
  selectedCommit = emptyCommit;
  rowHeight = 24;
  sidebar = "";
}

class Mutations extends injected.Mutations<State>() {
  resetItems(
    commits: Commit[],
    graphs: Dict<GraphFragment>,
    refs: Dict<Ref[]>
  ) {
    const state = this.state;
    state.commits = commits;
    state.graphs = graphs;
    state.refs = refs;
    state.selectedIndex = -1;
    state.selectedCommit = emptyCommit;
  }

  resetRefs(refs: Refs) {
    this.state.refs = refs.refsById;
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

class Actions extends injected.Actions<State, any, Mutations>() {
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
    this.mutations.resetItems(commits, graphs, refs.refsById);
  }

  showCommitDetail(commit: CommitDetail) {
    this.mutations.setCommitDetail(commit);
  }

  async setSelectedIndex(index: number): Promise<undefined> {
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

  showSidebar(name: string) {
    this.mutations.setSidebarName(name);
  }

  hideSidebar() {
    this.mutations.setSidebarName("");
  }

  resetConfig(config: Config): Promise<null> {
    return browserCommand.resetConfig(config);
  }

  runInteractiveShell(): Promise<null> {
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
}

export const store = sinai.store(
  sinai
    .module({
      state: State,
      mutations: Mutations,
      actions: Actions
    })
    .child("dialog", dialogModule)
);

export type AppStore = typeof store;
export const VueWithStore: VueConstructor<
  Vue & { $store: AppStore }
> = Vue as any;
export const componentWithStore = tsx.extendFrom(VueWithStore).create;
