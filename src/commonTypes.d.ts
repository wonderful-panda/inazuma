/*
 * Type definitions needed by both browser and renderer
 */
import type * as tt from "./react/types/tauri-types";

declare global {
  type Commit = tt.Commit;
  type FileEntry = tt.FileEntry & {
    unstaged?: boolean;
  };
  type LstreeEntry = tt.LstreeEntry;
  type LstreeEntryData = LstreeEntry["data"];
  type CommitDetail = tt.CommitDetail;
  type CommitOptions = tt.CommitOptions;
  type FileSpec = tt.FileSpec;
  type Ref = tt.Ref;
  type BranchRef = tt.BranchRef;
  type RemoteRef = tt.RemoteRef;
  type TagRef = tt.TagRef;

  type Resolve<T> = (arg: T) => void;
  type Dict<T> = { [key: string]: T };
  type Consumer<T> = (value: T) => void;
  type Func<P, R> = (arg: P) => R;

  type FontSize = tt.FontSize;

  /**
   * Auto updated parsistent data written to .environment.json
   */
  type Environment = tt.Environment;

  /**
   * User specific parsistent data written to config.json
   */
  type Config = tt.Config;

  type Refs = {
    head?: string;
    mergeHeads: string[];
    branches: tt.BranchRef[];
    tags: tt.TagRef[];
    remotes: Record<string, tt.RemoteRef[]>;
    refsById: Record<string, tt.Ref[]>;
  };

  interface DagNode {
    id: string;
    parentIds: string[];
  }

  type FileCommit = tt.Commit & tt.FileEntry;

  type WorkingTreeStat = tt.Commit & {
    unstagedFiles: FileEntry[];
    stagedFiles: FileEntry[];
  };

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

  interface TextFile extends FileSpec {
    encoding: string;
    content: string;
  }

  interface ErrorLike {
    name: string;
    message: string;
    stack?: string;
  }
}
