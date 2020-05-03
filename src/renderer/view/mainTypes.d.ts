import { GraphFragment } from "core/grapher";

export interface ErrorLikeObject {
  message: string;
}

export interface LogItem {
  graph: GraphFragment;
  commit: Commit;
  refs: Ref[];
}

export interface TabDefinition<
  Kind extends string = string,
  Props extends {} = {},
  LazyProps extends {} = {}
> {
  kind: Kind;
  key: string;
  text: string;
  closable?: boolean;
  props: Props;
  lazyProps?: LazyProps;
}

export type LogTabDefinition = TabDefinition<"log">;
export type FileTabDefinition = TabDefinition<
  "file",
  { sha: string; relPath: string },
  { blame: Blame }
>;
export type TreeTabDefinition = TabDefinition<
  "tree",
  { sha: string },
  { rootNodes: ReadonlyArray<LsTreeEntry> }
>;
export type DiffTabDefinition = TabDefinition<
  "diff",
  { left: FileSpec; right: FileSpec },
  { leftContent: TextFile; rightContent: TextFile }
>;

export type RepositoryTabDefinition =
  | LogTabDefinition
  | FileTabDefinition
  | TreeTabDefinition
  | DiffTabDefinition;

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

export type SplitterDirection = "horizontal" | "vertical";
export type Orientation = "portrait" | "landscape";
