import Vue, { VueConstructor } from "vue";
import * as sinai from "sinai";
import * as tsx from "vue-tsx-support";
import { AppState, LogItem, ErrorLikeObject } from "../mainTypes";
import { GraphFragment, Grapher } from "core/grapher";
import { browserCommand } from "core/browser";
import { dialogModule } from "./dialogModule";
import { errorReporterModule } from "./errorReporterModule";
import { tabsModule } from "./tabsModule";
import { getFileName } from "core/utils";
import { shortHash } from "../filters";

const emptyCommit: CommitDetail = {
  id: "",
  summary: "",
  author: "",
  parentIds: [],
  body: "",
  date: 0,
  files: []
};

const injected = sinai
  .inject("dialog", dialogModule)
  .and("errorReporter", errorReporterModule)
  .and("tabs", tabsModule);

class State implements AppState {
  config: Config = { fontFamily: {}, recentListCount: 5 };
  environment: Environment = { recentOpened: [], displayState: {} };
  repoPath = "";
  commits = [] as Commit[];
  graphs = {} as Dict<GraphFragment>;
  refs = {} as Refs;
  selectedIndex = -1;
  selectedCommit = emptyCommit;
  rowHeight = 24;
  sidebar = "";
  preferenceShown = false;
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
    this.state.environment = Object.freeze(env);
  }

  resetConfig(config: Config) {
    this.state.config = Object.freeze(config);
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
  setPreferenceShown(value: boolean) {
    this.state.preferenceShown = value;
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
  get repoPathEncoded(): string {
    return encodeURIComponent(this.state.repoPath);
  }
  get repoName(): string {
    return getFileName(this.state.repoPath) || this.state.repoPath;
  }
}

class Actions extends injected.Actions<State, Getters, Mutations>() {
  showError(e: ErrorLikeObject) {
    console.log(e);
    this.modules.errorReporter.actions.show(e);
  }

  environmentChanged(env: Environment) {
    this.mutations.resetEnvironment(env);
  }

  configChanged(config: Config) {
    this.mutations.resetConfig(config);
  }

  async setRepositoryPath(repoPath: string): Promise<void> {
    if (store.state.repoPath === repoPath) {
      return;
    }
    if (repoPath) {
      try {
        const { commits, refs } = await browserCommand.openRepository(repoPath);
        store.mutations.setRepoPath(repoPath);
        store.actions.tabs.reset([
          { key: "log", kind: "log", text: "COMMITS" }
        ]);
        store.actions.showCommits(commits, refs);
      } catch (e) {
        store.actions.showError(e);
      }
    } else {
      store.mutations.setRepoPath(repoPath);
      store.actions.tabs.reset([]);
    }
  }

  private showCommits(commits: Commit[], refs: Refs) {
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
    try {
      this.mutations.setSelectedIndex(index);
      const { repoPath, commits } = this.state;
      const detail = await browserCommand.getCommitDetail({
        repoPath,
        sha: commits[index].id
      });
      this.showCommitDetail(detail);
    } catch (e) {
      this.showError(e);
    }
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
    try {
      await browserCommand.showExternalDiff({
        repoPath: this.state.repoPath,
        left,
        right
      });
    } catch (e) {
      this.showError(e);
    }
  }

  showPreference() {
    this.mutations.setPreferenceShown(true);
  }
  hidePreference() {
    this.mutations.setPreferenceShown(false);
  }

  async showFileTab(sha: string, item: FileEntry): Promise<void> {
    try {
      const blame = Object.freeze(
        await browserCommand.getBlame({
          repoPath: this.state.repoPath,
          relPath: item.path,
          sha
        })
      );
      this.modules.tabs.actions.addOrSelect({
        key: `file/${item.path}:${sha}`,
        kind: "file",
        text: `${getFileName(item.path)} @ ${shortHash(sha)}`,
        params: { sha, path: item.path, blame },
        closable: true
      });
    } catch (e) {
      this.modules.errorReporter.actions.show(e);
    }
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
    .child("errorReporter", errorReporterModule)
    .child("tabs", tabsModule)
);

export type AppStore = typeof store;
export const VueWithStore: VueConstructor<
  Vue & { $store: AppStore }
> = Vue as any;
export const componentWithStore = tsx.extendFrom(VueWithStore).create;
