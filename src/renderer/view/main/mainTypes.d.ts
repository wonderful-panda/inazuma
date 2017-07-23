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

