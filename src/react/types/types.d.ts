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

  type Commit = import("@backend/Commit").Commit;
  type FileEntry = import("@backend/FileEntry").FileEntry & {
    unstaged?: boolean;
  };
  type LstreeEntry = import("@backend/LstreeEntry").LstreeEntry;
  type LstreeData = import("@backend/LstreeData").LstreeData;
  type CommitDetail = import("@backend/CommitDetail").CommitDetail;
  type CommitOptions = import("@backend/CommitOptions").CommitOptions;
  type FileSpec = import("@backend/FileSpec").FileSpec;
  type RawRefs = import("@backend/Refs").Refs;
  type Ref = import("@backend/Ref").Ref;
  type FontSize = import("@backend/FontSize").FontSize;
  type FontFamily = import("@backend/FontFamily").FontFamily;
  type Environment = import("@backend/Environment").Environment;
  type Config = import("@backend/Config").Config;

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
    unmergedFiles: FileEntry[];
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
