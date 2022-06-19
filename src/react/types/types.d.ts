import { ReactNode } from "react";
import type * as backend from "@/generated/backend-types";

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

  type Commit = backend.Commit;
  type FileEntry = backend.FileEntry & {
    unstaged?: boolean;
  };
  type LstreeEntry = backend.LstreeEntry;
  type LstreeData = backend.LstreeData;
  type CommitDetail = backend.CommitDetail;
  type CommitOptions = backend.CommitOptions;
  type FileSpec = backend.FileSpec;
  type RawRefs = backend.Refs;
  type Ref = backend.Ref;
  type FontSize = backend.FontSize;
  type FontFamily = backend.FontFamily;
  type Environment = backend.Environment;
  type Config = backend.Config;

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

  type FileCommit = Commit & FileEntry;

  type WorkingTreeStat = Commit & {
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
