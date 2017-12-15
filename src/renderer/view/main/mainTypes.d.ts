import { GraphFragment } from "core/grapher";
import { VtableColumn } from "vue-vtable";

export interface LogItem {
    graph: GraphFragment;
    commit: Commit;
    refs: Ref[];
}

export interface AppState {
    repoPath: string;
    environment: Environment;
    config: Config;
    columns: ReadonlyArray<VtableColumn>;
    commits: Commit[];
    graphs: Dict<GraphFragment>;
    refs: Dict<Ref[]>;
    selectedIndex: number;
    selectedCommit: CommitDetail;
    rowHeight: number;
    sidebar: string;
}
