import { GraphFragment } from "core/grapher";
import { TabDefinition } from "../common/types";

export interface LogItem {
  graph: GraphFragment;
  commit: Commit;
  refs: Ref[];
}

export interface AppState {
  repoPath: string;
  environment: Environment;
  config: Config;
  commits: Commit[];
  graphs: Dict<GraphFragment>;
  refs: Refs;
  selectedIndex: number;
  selectedCommit: CommitDetail;
  rowHeight: number;
  sidebar: string;
  preferenceShown: boolean;
}
