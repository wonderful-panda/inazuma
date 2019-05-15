import Vue, { VueConstructor } from "vue";
import * as tsx from "vue-tsx-support";
import {
  LogItem,
  ErrorLikeObject,
  TabDefinition,
  FileTabDefinition,
  TreeTabDefinition,
  RepositoryTabDefinition
} from "../mainTypes";
import { GraphFragment, Grapher } from "core/grapher";
import { browserCommand } from "core/browser";
import { dialogModule } from "./dialogModule";
import { errorReporterModule } from "./errorReporterModule";
import { tabsModule } from "./tabsModule";
import { getFileName } from "core/utils";
import { shortHash } from "../filters";
import { sortTreeInplace } from "core/tree";
import {
  Mutations,
  Getters,
  Context,
  Actions,
  Module,
  createStore
} from "vuex-smart-module";
import { Store } from "vuex";

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

type TabLazyPropPayload<D extends TabDefinition> = Pick<
  Required<D>,
  "kind" | "key" | "lazyProps"
>;

class RootState {
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

class RootMutations extends Mutations<RootState> {
  resetItems(payload: {
    commits: Commit[];
    graphs: Dict<GraphFragment>;
    refs: Refs;
  }) {
    const state = this.state;
    state.commits = payload.commits;
    state.graphs = payload.graphs;
    state.refs = payload.refs;
    state.selectedIndex = -1;
    state.selectedCommit = emptyCommit;
  }

  resetRefs(payload: { refs: Refs }) {
    this.state.refs = payload.refs;
  }

  resetConfig(payload: { config: Config }) {
    this.state.config = Object.freeze(payload.config);
  }

  resetRecentList(payload: { value: string[] }) {
    this.state.recentList = payload.value;
  }

  addRecentList(payload: { repoPath: string }) {
    const { repoPath } = payload;
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
  removeRecentList(payload: { repoPath: string }) {
    const index = this.state.recentList.indexOf(payload.repoPath);
    if (0 <= index) {
      Vue.delete(this.state.recentList, index);
    }
  }

  setRepoPath(payload: { repoPath: string }) {
    const { repoPath } = payload;
    const state = this.state;
    state.repoPath = repoPath;
    state.commits = [];
    state.graphs = {};
    state.graphs = {};
    state.selectedIndex = -1;
    state.selectedCommit = emptyCommit;
    if (repoPath) {
      this.addRecentList(payload);
    }
  }

  setSelectedIndex(payload: { index: number }) {
    const state = this.state;
    state.selectedIndex = payload.index;
    state.selectedCommit = emptyCommit;
  }

  setCommitDetail(payload: { commit: CommitDetail }) {
    const commit = payload.commit;
    const { commits, selectedIndex } = this.state;
    if (commits[selectedIndex].id === commit.id) {
      this.state.selectedCommit = commit;
    }
  }

  setSidebarName(payload: { name: string }) {
    this.state.sidebar = payload.name;
  }
  setPreferenceShown(payload: { value: boolean }) {
    this.state.preferenceShown = payload.value;
  }

  setNotification(payload: { message: string }) {
    this.state.notification = payload.message;
  }
}

class RootGetters extends Getters<RootState> {
  tabs!: Context<typeof tabsModule>;

  $init(store: Store<any>) {
    this.tabs = tabsModule.context(store);
  }

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
  get repositoryTabs(): RepositoryTabDefinition[] {
    return this.tabs.state.tabs as any;
  }
}

class RootActions extends Actions<RootState, RootGetters, RootMutations>
  implements BroadcastAction {
  tabs!: Context<typeof tabsModule>;
  errorReporter!: Context<typeof errorReporterModule>;
  dialog!: Context<typeof dialogModule>;
  $init(store: Store<any>) {
    this.tabs = tabsModule.context(store);
    this.errorReporter = errorReporterModule.context(store);
    this.dialog = dialogModule.context(store);
  }

  // from BroadcastAction
  configChanged(payload: { config: Config }) {
    this.mutations.resetConfig(payload);
  }

  showError(payload: { error: ErrorLikeObject }) {
    console.log(payload.error);
    this.errorReporter.actions.show(payload);
  }

  showWelcomePage(): void {
    this.mutations.setRepoPath({ repoPath: "" });
    this.tabs.actions.reset({ tabs: [] });
  }

  showRepositoryPage(payload: { repoPath: string; tabs?: TabDefinition[] }) {
    this.mutations.setRepoPath({ repoPath: payload.repoPath });
    this.tabs.actions.reset({
      tabs: payload.tabs || [
        { key: "log", kind: "log", text: "COMMITS", props: {} }
      ]
    });
  }

  async openRepository(payload: { repoPath: string }): Promise<void> {
    try {
      const { repoPath } = payload;
      const { commits, refs } = await browserCommand.openRepository(repoPath);
      if (this.state.repoPath !== repoPath) {
        this.mutations.setRepoPath({ repoPath });
        this.tabs.actions.reset({
          tabs: [{ key: "log", kind: "log", text: "COMMITS", props: {} }]
        });
      }
      this.showCommits({ commits, refs });
    } catch (error) {
      this.showError({ error });
    }
  }

  private showCommits(payload: { commits: Commit[]; refs: Refs }) {
    const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
    const graphs = {} as { [id: string]: GraphFragment };
    payload.commits.forEach(c => {
      graphs[c.id] = grapher.proceed(c);
    });
    this.mutations.resetItems({ graphs, ...payload });
  }

  showCommitDetail(payload: { commit: CommitDetail }) {
    this.mutations.setCommitDetail(payload);
  }

  async setSelectedIndex(payload: { index: number }): Promise<void> {
    if (this.state.selectedIndex === payload.index) {
      return;
    }
    try {
      this.mutations.setSelectedIndex(payload);
      const { repoPath, commits } = this.state;
      const commit = await browserCommand.getCommitDetail({
        repoPath,
        sha: commits[payload.index].id
      });
      this.showCommitDetail({ commit });
    } catch (error) {
      this.showError({ error });
    }
  }

  selectCommit(payload: { commitId: string }): Promise<void> {
    const index = this.state.commits.findIndex(c => c.id === payload.commitId);
    if (0 <= index) {
      return this.setSelectedIndex({ index });
    } else {
      return Promise.resolve();
    }
  }

  showSidebar(payload: { name: string }) {
    this.mutations.setSidebarName(payload);
  }

  hideSidebar() {
    this.mutations.setSidebarName({ name: "" });
  }

  resetConfig(config: Config): Promise<void> {
    return browserCommand.resetConfig(config);
  }

  runInteractiveShell(): Promise<void> {
    return browserCommand.runInteractiveShell(this.state.repoPath);
  }

  async showVersionDialog(): Promise<boolean> {
    const ret = await this.dialog.dispatch({
      type: "show",
      options: {
        title: "Version",
        renderContent: _h => "Version dialog: Not implemented",
        buttons: []
      }
    });
    return ret.accepted;
  }

  async showExternalDiff(payload: {
    left: DiffFile;
    right: DiffFile;
  }): Promise<void> {
    if (!this.state.config.externalDiffTool) {
      return;
    }
    try {
      await browserCommand.showExternalDiff({
        repoPath: this.state.repoPath,
        ...payload
      });
    } catch (error) {
      this.showError({ error });
    }
  }

  showNotification(payload: { message: string }) {
    this.mutations.setNotification(payload);
  }
  hideNotification() {
    this.mutations.setNotification({ message: "" });
  }

  showPreference() {
    this.mutations.setPreferenceShown({ value: true });
  }
  hidePreference() {
    this.mutations.setPreferenceShown({ value: false });
  }

  showFileTab({ sha, relPath }: { sha: string; relPath: string }) {
    try {
      this.tabs.actions.addOrSelect({
        tab: {
          key: `file/${relPath}:${sha}`,
          kind: "file",
          text: `${getFileName(relPath)} @ ${shortHash(sha)}`,
          props: { sha, relPath },
          closable: true
        }
      });
    } catch (error) {
      this.showError({ error });
    }
  }

  async loadFileTabLazyProps({ key }: { key: string }) {
    const tab = this.getters.repositoryTabs.find(t => t.key === key);
    if (!tab || tab.kind !== "file") {
      return;
    }
    const repoPath = this.state.repoPath;
    const { sha, relPath } = tab.props;
    try {
      const blame = Object.freeze(
        await browserCommand.getBlame({ repoPath, sha, relPath })
      );
      const payload: TabLazyPropPayload<FileTabDefinition> = {
        kind: "file",
        key,
        lazyProps: { blame }
      };
      this.tabs.actions.setTabLazyProps(payload);
    } catch (error) {
      this.showError({ error });
      this.removeTab({ key });
    }
  }

  showTreeTab({ sha }: { sha: string }) {
    try {
      const tab: TreeTabDefinition = {
        key: `tree/${sha}`,
        kind: "tree",
        text: `TREE @ ${shortHash(sha)}`,
        props: { sha },
        closable: true
      };
      this.tabs.actions.addOrSelect({ tab });
    } catch (error) {
      this.showError({ error });
    }
  }

  async loadTreeTabLazyProps({ key }: { key: string }) {
    const tab = this.getters.repositoryTabs.find(t => t.key === key);
    if (!tab || tab.kind !== "tree") {
      return;
    }
    const repoPath = this.state.repoPath;
    const { sha } = tab.props;
    try {
      const rootNodes = await browserCommand.getTree({ repoPath, sha });
      sortTreeInplace(rootNodes, (a, b) => {
        return (
          a.data.type.localeCompare(b.data.type) * -1 ||
          a.data.path.localeCompare(b.data.path)
        );
      });
      const payload: TabLazyPropPayload<TreeTabDefinition> = {
        kind: "tree",
        key,
        lazyProps: {
          rootNodes: Object.freeze(rootNodes)
        }
      };
      this.tabs.actions.setTabLazyProps(payload);
    } catch (error) {
      this.showError({ error });
      this.removeTab({ key });
    }
  }

  removeTab(payload: { key: string }) {
    this.tabs.actions.remove(payload);
  }

  removeRecentList(payload: { repoPath: string }) {
    this.mutations.removeRecentList(payload);
  }
}

const modules = {
  tabs: tabsModule,
  dialog: dialogModule,
  errorReporter: errorReporterModule
};

export const rootModule = new Module({
  state: RootState,
  mutations: RootMutations,
  getters: RootGetters,
  actions: RootActions,
  modules
});

type ModuleState<M> = M extends Module<infer S, any, any, any> ? S : {};

type CombinedState<
  RootState,
  M extends { [key: string]: Module<any, any, any, any> }
> = RootState & { [K in keyof M]: ModuleState<M[K]> };

export type AppState = CombinedState<RootState, typeof modules>;
export type AppStore = Store<AppState>;
export const store: AppStore = createStore(rootModule);

export const withStore = tsx.componentFactory.mixin(
  (Vue as VueConstructor<Vue & { $store: AppStore }>).extend({
    computed: {
      state(): AppState {
        return this.$store.state;
      }
    }
  })
);
