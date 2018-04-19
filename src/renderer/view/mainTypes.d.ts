import { GraphFragment } from "core/grapher";

export interface ErrorLikeObject {
  message: string;
}

export interface LogItem {
  graph: GraphFragment;
  commit: Commit;
  refs: Ref[];
}

export interface TabDefinition {
  key: string;
  kind: string;
  params?: any;
  text: string;
  closable?: boolean;
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
