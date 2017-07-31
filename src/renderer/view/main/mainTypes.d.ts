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
    columns: VtableColumn<LogItem>[];
    commits: Commit[];
    graphs: { [id: string]: GraphFragment };
    refs: { [id: string]: Ref[] };
    selectedIndex: number;
    selectedCommit: CommitDetail;
    rowHeight: number;
    sidebar: string;
}

