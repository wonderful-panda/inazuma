import Vue, { VueConstructor } from "vue";
import * as sinai from "sinai";
import * as tsx from "vue-tsx-support";
import {
  AppState,
  LogItem,
  ErrorLikeObject,
  TabDefinition
} from "../mainTypes";
import { GraphFragment, Grapher } from "core/grapher";
import { browserCommand } from "core/browser";
import { dialogModule } from "./dialogModule";
import { errorReporterModule } from "./errorReporterModule";
import { tabsModule } from "./tabsModule";
import { getFileName } from "core/utils";
import { shortHash } from "../filters";
import { sortTreeInplace } from "core/tree";

const emptyCommit: CommitDetail = {
  id: "",
  summary: "",
  author: "",
  parentIds: [],
  body: "",
  date: 0,
  files: []
};

const MAX_RECENT_LIST = 20;

const injected = sinai
  .inject("dialog", dialogModule)
  .and("errorReporter", errorReporterModule)
  .and("tabs", tabsModule);

class State implements AppState {
  config: Config = { fontFamily: {}, recentListCount: 5 };
  repoPath = "";
  recentList = [] as string[];
  commits = [] as Commit[];
  graphs = {} as Dict<GraphFragment>;
  refs = {} as Refs;
  selectedIndex = -1;
  selectedCommit = emptyCommit;
  rowHeight = 24;
  sidebar = "";
  preferenceShown = false;
  notification = "";
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

  resetConfig(config: Config) {
    this.state.config = Object.freeze(config);
  }

  resetRecentList(value: string[]) {
    this.state.recentList = value;
  }

  addRecentList(repoPath: string) {
    if (this.state.recentList[0] === repoPath) {
      return;
    }
    this.state.recentList = [
      repoPath,
      ...this.state.recentList
        .filter(v => v !== repoPath)
        .slice(0, MAX_RECENT_LIST - 1)
    ];
  }
  removeRecentList(repoPath: string) {
    const index = this.state.recentList.indexOf(repoPath);
    if (0 <= index) {
      Vue.delete(this.state.recentList, index);
    }
  }

  setRepoPath(repoPath: string) {
    const state = this.state;
    state.repoPath = repoPath;
    state.commits = [];
    state.graphs = {};
    state.graphs = {};
    state.selectedIndex = -1;
    state.selectedCommit = emptyCommit;
    if (repoPath) {
      this.addRecentList(repoPath);
    }
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

  setNotification(value: string) {
    this.state.notification = value;
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
  get visibleRecentList(): string[] {
    return this.state.recentList.slice(0, this.state.config.recentListCount);
  }
}

class Actions extends injected.Actions<State, Getters, Mutations>() {
  showError(e: ErrorLikeObject) {
    console.log(e);
    this.modules.errorReporter.actions.show(e);
  }

  configChanged(config: Config) {
    this.mutations.resetConfig(config);
  }

  showWelcomePage(): void {
    this.mutations.setRepoPath("");
    this.modules.tabs.actions.reset([]);
  }

  showRepositoryPage(repoPath: string, tabs?: TabDefinition[]) {
    this.mutations.setRepoPath(repoPath);
    this.modules.tabs.actions.reset(
      tabs || [{ key: "log", kind: "log", text: "COMMITS" }]
    );
  }

  async openRepository(repoPath: string): Promise<void> {
    try {
      const { commits, refs } = await browserCommand.openRepository(repoPath);
      if (this.state.repoPath !== repoPath) {
        this.mutations.setRepoPath(repoPath);
        this.modules.tabs.actions.reset([
          { key: "log", kind: "log", text: "COMMITS" }
        ]);
      }
      this.showCommits(commits, refs);
    } catch (e) {
      this.showError(e);
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

  showNotification(message: string) {
    this.mutations.setNotification(message);
  }
  hideNotification() {
    this.mutations.setNotification("");
  }

  showPreference() {
    this.mutations.setPreferenceShown(true);
  }
  hidePreference() {
    this.mutations.setPreferenceShown(false);
  }

  async showFileTab(sha: string, relPath: string): Promise<void> {
    try {
      const { repoPath } = this.state;
      const blame = await browserCommand.getBlame({
        repoPath,
        relPath,
        sha
      });
      this.modules.tabs.actions.addOrSelect({
        key: `file/${relPath}:${sha}`,
        kind: "file",
        text: `${getFileName(relPath)} @ ${shortHash(sha)}`,
        params: { sha, path: relPath, blame },
        closable: true
      });
    } catch (e) {
      this.modules.errorReporter.actions.show(e);
    }
  }

  async showTreeTab(sha: string): Promise<void> {
    try {
      const rootNodes = await browserCommand.getTree({
        repoPath: this.state.repoPath,
        sha
      });
      sortTreeInplace(rootNodes, (a, b) => {
        return (
          a.data.type.localeCompare(b.data.type) * -1 || // tree, then blob
          a.data.basename.localeCompare(b.data.basename)
        );
      });
      this.modules.tabs.actions.addOrSelect({
        key: `tree/${sha}`,
        kind: "tree",
        text: `TREE @ ${shortHash(sha)}`,
        params: { sha, rootNodes },
        closable: true
      });
    } catch (e) {
      this.modules.errorReporter.actions.show(e);
    }
  }

  removeRecentList(repoPath: string) {
    this.mutations.removeRecentList(repoPath);
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
// @vue/component
export const StoreMixin = (Vue as VueConstructor<
  Vue & { $store: AppStore }
>).extend({
  computed: {
    state(this: { $store: AppStore }): AppStore["state"] {
      return this.$store.state;
    },
    actions(this: { $store: AppStore }): AppStore["actions"] {
      return this.$store.actions;
    },
    getters(this: { $store: AppStore }): AppStore["getters"] {
      return this.$store.getters;
    }
  }
});

export const storeComponent = tsx.componentFactory.mixin(StoreMixin);
