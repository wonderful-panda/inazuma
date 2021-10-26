/*
 * Type definitions needed by both browser and renderer
 */
import type * as backend from "inazuma-rust-backend";
import type * as Electron from "electron";

declare global {
  type Commit = backend.Commit;
  type FileEntry = backend.FileEntry;
  type LstreeEntry = backend.LstreeEntry;
  type CommitDetail = backend.CommitDetail;
  type BranchRef = backend.BranchRef;
  type HeadRef = backend.HeadRef;
  type MergeHeadRef = backend.MergeHeadRef;
  type TagRef = backend.TagRef;
  type RemoteRef = backend.RemoteRef;
  type Ref = backend.Ref;

  type Resolve<T> = (arg: T) => void;
  type Dict<T> = { [key: string]: T };
  type Consumer<T> = (value: T) => void;
  type Func<P, R> = (arg: P) => R;

  type FontSize = "small" | "medium";

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

  interface WorkingTreeStat {
    id: "--";
    parentIds: string[];
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

  interface BrowserCommand {
    openRepository(repoPath: string): Promise<{ commits: Commit[]; refs: Refs }>;
    getLogDetail(params: { repoPath: string; sha: string }): Promise<LogDetail>;
    getBlame(params: { repoPath: string; relPath: string; sha: string }): Promise<Blame>;
    getFileLog(params: { repoPath: string; relPath: string; sha: string }): Promise<FileCommit[]>;
    getTree(params: { repoPath: string; sha: string }): Promise<LstreeEntry[]>;
    getConfig(): Promise<Config>;
    loadPersistentData(): Promise<{ config: Config; environment: Environment }>;
    saveEnvironment<K extends keyof Environment>(key: K, value: Environment[K]): Promise<void>;
    resetConfig(config: Config): Promise<void>;
    runInteractiveShell(curdir: string): Promise<void>;
    showExternalDiff(params: { repoPath: string; left: FileSpec; right: FileSpec }): Promise<void>;
    getTextFileContent(params: { repoPath: string; file: FileSpec }): Promise<TextFile>;
    yankText(text: string): Promise<void>;
    showOpenDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>;
    __openPty(options: OpenPtyOptions): Promise<number>;
  }

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

  interface RendererGlobals {
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
      ) => Promise<{
        [K in keyof PtyCommands]: (payload: PtyCommands[K]) => Promise<void>;
      }>;
    };
  }
}
