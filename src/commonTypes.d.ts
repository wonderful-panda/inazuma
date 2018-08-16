/*
 * Type definitions needed by both browser and renderer
 */

declare type Resolve<T> = (arg: T) => void;
declare type Dict<T> = { [key: string]: T };
declare type Consumer<T> = (value: T) => void;

/**
 * Auto updated parsistent data written to .environment.json
 */
declare interface Environment {
  recentOpened: string[];
  windowSize?: {
    width: number;
    height: number;
    maximized: boolean;
  };
}

/**
 * User specific parsistent data written to config.json
 */
declare interface Config {
  fontFamily: {
    standard?: string;
    monospace?: string;
  };
  recentListCount: number;
  externalDiffTool?: string;
  interactiveShell?: string;
  vueDevTool?: string;
}

declare interface RefBase<TypeName extends string> {
  type: TypeName;
  id: string;
  fullname: string;
}
declare interface HeadRef extends RefBase<"HEAD"> {}
declare interface MergeHeadRef extends RefBase<"MERGE_HEAD"> {}
declare interface BranchRef extends RefBase<"heads"> {
  name: string;
  current: boolean;
}
declare interface TagRef extends RefBase<"tags"> {
  name: string;
  tagId: string;
}
declare interface RemoteRef extends RefBase<"remotes"> {
  remote: string;
  name: string;
}

declare type Ref = HeadRef | MergeHeadRef | BranchRef | TagRef | RemoteRef;

declare interface Refs {
  head?: string;
  mergeHeads: string[];
  remotes: { [remote: string]: Ref[] };
  heads: Ref[];
  tags: Ref[];
  refsById: Dict<Ref[]>;
}

declare interface DagNode {
  id: string;
  parentIds: string[];
}

declare interface Commit extends DagNode {
  summary: string;
  date: number;
  author: string;
}

declare interface FileCommit extends Commit {
  statusCode: string;
  path: string;
  oldPath?: string;
}

declare interface BlameCommit {
  id: string;
  summary: string;
  date: number;
  author: string;
  filename: string;
  boundary: boolean;
  previous?: string;
  previousFilename?: string;
}

declare interface Blame {
  commits: ReadonlyArray<FileCommit>;
  commitIds: ReadonlyArray<string>;
  content: {
    text: string;
    encoding: string;
  };
}

declare interface FileEntry {
  path: string;
  oldPath?: string;
  statusCode: string;
  inIndex?: boolean;
  inWorkingTree?: boolean;
}

declare interface CommitDetail extends Commit {
  body: string;
  files: FileEntry[];
}

declare interface BroadcastAction {
  environmentChanged: Environment;
  configChanged: Config;
}

declare interface DiffFile {
  path: string;
  sha: string;
}

declare interface LsTreeEntry {
  data: {
    path: string;
    basename: string;
    type: "blob" | "tree";
  };
  children?: LsTreeEntry[];
}

declare interface BrowserCommand {
  openRepository(repoPath: string): Promise<{ commits: Commit[]; refs: Refs }>;
  getCommitDetail(params: {
    repoPath: string;
    sha: string;
  }): Promise<CommitDetail>;
  getBlame(params: {
    repoPath: string;
    relPath: string;
    sha: string;
  }): Promise<Blame>;
  getFileLog(params: {
    repoPath: string;
    relPath: string;
    sha: string;
  }): Promise<FileCommit[]>;
  getTree(params: { repoPath: string; sha: string }): Promise<LsTreeEntry[]>;
  resetConfig(config: Config): Promise<void>;
  runInteractiveShell(curdir: string): Promise<void>;
  showExternalDiff(params: {
    repoPath: string;
    left: DiffFile;
    right: DiffFile;
  }): Promise<void>;
}
