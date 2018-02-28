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
  displayState?: { [name: string]: any };
}

/**
 * User specific parsistent data written to config.json
 */
declare interface Config {
  recentListCount: number;
  externalDiffTool: string;
  interactiveShell: string;
  vueDevTool: string;
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
  remotes: { [remote: string]: { [name: string]: string } };
  heads: { [name: string]: string };
  tags: { [name: string]: string };
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
  saveDisplayState(displayState: { [name: string]: any }): Promise<void>;
}
