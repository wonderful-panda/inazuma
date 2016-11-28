import * as Vuex from "vuex";
import { GraphFragment } from "./grapher";
import { VtableColumn } from "vue-vtable";

export interface LogItem {
    graph: GraphFragment;
    commit: Commit;
}

export interface AppState {
    repoPath: string;
    environment: Environment,
    columns: VtableColumn<LogItem>[];
    items: LogItem[];
    selectedIndex: number;
    selectedCommit: CommitDetail;
    rowHeight: number;
}

interface MutationPayload {
    resetItems: LogItem[];
    resetEnvironment: Environment;
    setRepoPath: string;
    setSelectedIndex: number;
    setCommitDetail: CommitDetail;
}

type ActionPayloadWithType<K extends keyof ActionPayload> = { type: K; } & ActionPayload[K];
type MutationPayloadWithType<K extends keyof MutationPayload> = { type: K; } & MutationPayload[K];

interface AppStoreDispatch {
    (type: keyof ActionPayload, payload: never): Promise<any[]>; // workaround for completion issue
    <K extends keyof ActionPayload>(type: K, payload: ActionPayload[K]): Promise<any[]>;
    <K extends keyof ActionPayload>(payloadWithType: ActionPayloadWithType<K>): Promise<any[]>;
}

interface AppStoreCommit {
    (type: keyof MutationPayload, payload: never): void; // workaround for completion issue
    <K extends keyof MutationPayload>(type: K, payload: MutationPayload[K], options?: Vuex.CommitOptions): void;
    <K extends keyof MutationPayload>(payloadWithType: MutationPayloadWithType<K>, options?: Vuex.CommitOptions): void;
}

export interface AppStore extends Vuex.Store<AppState> {
    dispatch: AppStoreDispatch;
    commit: AppStoreCommit;
}

export interface AppActionContext extends Vuex.ActionContext<AppState, AppState> {
    dispatch: AppStoreDispatch;
    commit: AppStoreCommit;
}

export type AppActionTree = Vuex.ActionTree<AppState, AppState>;
