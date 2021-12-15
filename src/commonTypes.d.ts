/*
 * Type definitions needed by both browser and renderer
 */
import type * as backend from "inazuma-rust-backend";

declare global {
  type Commit = backend.Commit;
  type FileEntry = backend.FileEntry & {
    unstaged?: boolean;
  };
  type LstreeEntry = backend.LstreeEntry;
  type LstreeEntryData = LstreeEntry["data"];
  type CommitDetail = backend.CommitDetail;
  type BranchRef = backend.BranchRef;
  type HeadRef = backend.HeadRef;
  type MergeHeadRef = backend.MergeHeadRef;
  type TagRef = backend.TagRef;
  type RemoteRef = backend.RemoteRef;
  type Ref = backend.Ref;
  type CommitOptions = backend.CommitOptions;

  type Resolve<T> = (arg: T) => void;
  type Dict<T> = { [key: string]: T };
  type Consumer<T> = (value: T) => void;
  type Func<P, R> = (arg: P) => R;

  type FontSize = "x-small" | "small" | "medium";

  /**
   * Auto updated parsistent data written to .environment.json
   */
  interface Environment {
    windowSize?: {
      width: number;
      height: number;
      maximized: boolean;
    };
    recentOpened?: string[];
    state?: Record<string, string>;
  }

  /**
   * User specific parsistent data written to config.json
   */
  interface Config {
    fontFamily: {
      standard?: string;
      monospace?: string;
    };
    fontSize: FontSize;
    recentListCount: number;
    externalDiffTool?: string;
    interactiveShell?: string;
  }

  interface Refs extends backend.Refs {
    refsById: Dict<Ref[]>;
  }

  interface DagNode {
    id: string;
    parentIds: string[];
  }

  type FileCommit = backend.FileLogEntry;

  interface WorkingTreeStat extends Commit {
    id: "--";
    untrackedFiles: string[];
    unstagedFiles: FileEntry[];
    stagedFiles: FileEntry[];
  }

  type LogDetail =
    | ({
        type: "commit";
      } & CommitDetail)
    | ({
        type: "status";
      } & WorkingTreeStat);

  interface Blame {
    commits: ReadonlyArray<FileCommit>;
    commitIds: ReadonlyArray<string>;
    content: {
      text: string;
      encoding: string;
    };
  }

  type Udiff =
    | {
        type: "text";
        content: string;
      }
    | {
        type: "binary" | "nodiff";
      };

  interface BrowserEvent {
    configChanged: { config: Config };
  }

  interface FileSpec {
    path: string;
    revspec: string;
  }

  interface TextFile extends FileSpec {
    encoding: string;
    content: string;
  }

  type OpenPtyOptions = {
    cwd: string;
    file: string;
    args: readonly string[];
  };

  type PtyEvents = {
    data: string;
    exit: { exitCode: number; signal?: number };
  };

  type PtyListeners = {
    [K in keyof PtyEvents as `on${Capitalize<K>}`]: (payload: PtyEvents[K]) => void;
  };

  type PtyCommands = {
    data: string;
    resize: { cols: number; rows: number };
    kill: { signal?: string };
  };

  interface ErrorLike {
    name: string;
    message: string;
    stack?: string;
  }

  type BrowserCommandResult =
    | {
        status: "succeeded";
        result: any;
      }
    | {
        status: "failed";
        error: ErrorLike;
      };
}
