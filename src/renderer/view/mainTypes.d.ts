import { GraphFragment } from "core/grapher";

export interface ErrorLikeObject {
  message: string;
}

export interface LogItem {
  graph: GraphFragment;
  commit: Commit;
  refs: Ref[];
}

export interface TabDefinitionBase {
  key: string;
  text: string;
  closable?: boolean;
}
export interface LogTabDefinition extends TabDefinitionBase {
  kind: "log";
}
export interface FileTabDefinition extends TabDefinitionBase {
  kind: "file";
  params: { sha: string; path: string };
}
export interface TreeTabDefinition extends TabDefinitionBase {
  kind: "tree";
  params: { sha: string };
}

export type TabDefinition =
  | LogTabDefinition
  | FileTabDefinition
  | TreeTabDefinition;

export interface AppState {
  repoPath: string;
  config: Config;
  recentList: string[];
  commits: Commit[];
  graphs: Dict<GraphFragment>;
  refs: Refs;
  selectedIndex: number;
  selectedCommit: CommitDetail;
  rowHeight: number;
  sidebar: string;
  preferenceShown: boolean;
  notification: string;
}
