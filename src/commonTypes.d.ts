/*
 * Type definitions needed by both browser and renderer
 */

declare type Resolve<T> = (arg: T) => void;
declare type Dict<T> = { [key: string]: T };
declare type Consumer<T> = (value: T) => void;

declare interface DisplayState {
  main?: any;
}

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
  displayState: DisplayState;
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

declare type Ref = {
  id: string;
  fullname: string;
} & (
  | {
      type: "HEAD" | "MERGE_HEAD";
    }
  | {
      type: "heads";
      name: string;
      current: boolean;
    }
  | {
      type: "tags";
      name: string;
    }
  | {
      type: "remotes";
      remote: string;
      name: string;
    });

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

declare interface BrowserCommand {
  openRepository(repoPath: string): Promise<{ commits: Commit[]; refs: Refs }>;
  getCommitDetail(params: {
    repoPath: string;
    sha: string;
  }): Promise<CommitDetail>;
  resetConfig(config: Config): Promise<void>;
  runInteractiveShell(curdir: string): Promise<void>;
  showExternalDiff(params: {
    repoPath: string;
    left: DiffFile;
    right: DiffFile;
  }): Promise<void>;
  saveDisplayState(params: {
    key: keyof DisplayState;
    value: any;
  }): Promise<void>;
}
