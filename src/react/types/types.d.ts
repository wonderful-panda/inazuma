import * as tt from "../generated/tauri-types";
import { ReactNode } from "react";

declare global {
  interface Window {
    StringDecoder: typeof import("string_decoder").StringDecoder;
  }
  type ComponentRef<C> = C extends React.ForwardRefExoticComponent<infer P>
    ? P extends React.RefAttributes<infer T>
      ? T
      : never
    : never;

  type Orientation = "landscape" | "portrait";
  type Direction = "horiz" | "vert";

  type AlertType = "info" | "success" | "warning" | "error";

  type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

  type TauriInvoke = tt.TauriInvoke;

  type Commit = tt.Commit;
  type FileEntry = tt.FileEntry & {
    unstaged?: boolean;
  };
  type LstreeEntry = tt.LstreeEntry;
  type LstreeData = tt.LstreeData;
  type CommitDetail = tt.CommitDetail;
  type CommitOptions = tt.CommitOptions;
  type FileSpec = tt.FileSpec;
  type RawRefs = tt.Refs;
  type Ref = tt.Ref;
  type FontSize = tt.FontSize;
  type FontFamily = tt.FontFamily;
  type Environment = tt.Environment;
  type Config = tt.Config;

  type BranchRef = Extract<Ref, { type: "branch" }>;
  type TagRef = Extract<Ref, { type: "tag" }>;
  type RemoteRef = Extract<Ref, { type: "remote" }>;

  type Refs = {
    head?: string;
    mergeHeads: string[];
    branches: BranchRef[];
    tags: TagRef[];
    remotes: Record<string, RemoteRef[]>;
    refsById: Record<string, Ref[]>;
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

  type ChildrenProp = { children: ReactNode };
}
