import Vuex from "vuex";
import { GraphFragment } from "core/grapher";
import { VtableColumn } from "vue-vtable";

export interface LogItem {
    graph: GraphFragment;
    commit: Commit;
}

export interface AppState {
    repoPath: string;
    environment: Environment;
    config: Config;
    columns: VtableColumn<LogItem>[];
    items: LogItem[];
    selectedIndex: number;
    selectedCommit: CommitDetail;
    rowHeight: number;
    sidebar: string;
}

declare interface ActionPayload extends BroadcastAction {
    error: any;
    showRepositorySelectDialog: null;
    navigateToLog: string;
    navigateToRoot: null;
    showCommits: Commit[];
    showCommitDetail: CommitDetail;
    setSelectedIndex: number;
    showSidebar: string;
    hideSidebar: null;
    resetConfig: Config;
    runInteractiveShell: null;
}

interface MutationPayload {
    resetItems: LogItem[];
    resetEnvironment: Environment;
    resetConfig: Config;
    setRepoPath: string;
    setSelectedIndex: number;
    setCommitDetail: CommitDetail;
    setSidebarName: string;
}

interface AppDispatch {
    <K extends keyof ActionPayload>(type: K, payload: ActionPayload[K]): Promise<any[]>;
    <K extends keyof ActionPayload, V extends ActionPayload[K]>(payload: { type: K } & V): Promise<any[]>;
}

interface AppCommit {
    <K extends keyof MutationPayload>(type: K, payload: MutationPayload[K], options?: Vuex.CommitOptions): void;
    <K extends keyof MutationPayload, V extends keyof MutationPayload[K]>(payload: { type: K } & V, options?: Vuex.CommitOptions): void;
}

export interface AppStore extends Vuex.Store<AppState> {
    dispatch: AppDispatch;
    commit: AppCommit;
}

export interface AppActionContext extends Vuex.ActionContext<AppState, AppState> {
    dispatch: AppDispatch;
    commit: AppCommit;
}

export type AppActionTree = Vuex.ActionTree<AppState, AppState>;
