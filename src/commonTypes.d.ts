/*
 * Type definitions needed by both browser and renderer
 */

declare type Resolve<T> = (arg: T) => void;
declare type Dict<T> = { [key: string]: T };
declare type Consumer<T> = (value: T) => void;
declare type Func<P, R> = (arg: P) => R;

/**
 * Auto updated parsistent data written to .environment.json
 */
declare interface Environment {
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
  insertions?: number | "-";
  deletions?: number | "-";
  inIndex?: boolean;
  inWorkingTree?: boolean;
}

declare interface CommitDetail extends Commit {
  body: string;
  files: readonly FileEntry[];
}

declare interface BrowserEvent {
  configChanged: { config: Config };
}

declare interface FileSpec {
  path: string;
  revspec: string;
}

declare interface TextFile extends FileSpec {
  encoding: string;
  content: string;
}

declare interface LsTreeEntry {
  data: {
    path: string;
    basename: string;
    type: "blob" | "tree";
  };
  children?: LsTreeEntry[];
}

declare type OpenPtyOptions = {
  cwd: string;
  file: string;
  args: readonly string[];
};

declare type PtyEvents = {
  data: string;
  exit: { exitCode: number; signal?: number };
};

declare type PtyListeners = {
  [K in keyof PtyEvents as `on${Capitalize<K>}`]: (payload: PtyEvents[K]) => void;
};

declare type PtyCommands = {
  data: string;
  resize: { cols: number; rows: number };
  kill: { signal?: string };
};

declare interface BrowserCommand {
  openRepository(repoPath: string): Promise<{ commits: Commit[]; refs: Refs }>;
  getCommitDetail(params: { repoPath: string; sha: string }): Promise<CommitDetail>;
  getBlame(params: { repoPath: string; relPath: string; sha: string }): Promise<Blame>;
  getFileLog(params: { repoPath: string; relPath: string; sha: string }): Promise<FileCommit[]>;
  getTree(params: { repoPath: string; sha: string }): Promise<LsTreeEntry[]>;
  getConfig(): Promise<Config>;
  resetConfig(config: Config): Promise<void>;
  runInteractiveShell(curdir: string): Promise<void>;
  showExternalDiff(params: { repoPath: string; left: FileSpec; right: FileSpec }): Promise<void>;
  getTextFileContent(params: { repoPath: string; file: FileSpec }): Promise<TextFile>;
  yankText(text: string): Promise<void>;
  showOpenDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>;
  __openPty(options: OpenPtyOptions & { token: number }): Promise<void>;
}

declare interface RendererGlobals {
  browserApi: BrowserCommand;
  browserEvents: {
    listen: <K extends keyof BrowserEvent>(
      type: K,
      listener: (payload: BrowserEvent[K]) => void
    ) => void;
  };
  pty: {
    open: (
      options: OpenPtyOptions,
      listeners: PtyListeners
    ) => Promise<
      {
        [K in keyof PtyCommands]: (payload: PtyCommands[K]) => Promise<void>;
      }
    >;
  };
}
