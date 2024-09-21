export {};

declare global {
  interface Window {
    StringDecoder: typeof import("string_decoder").StringDecoder;
  }

  // from vite
  interface ImportMeta {
    env: {
      DEV: boolean;
      PROD: boolean;
      MODE: string;
      BASE_URL: string;
    };
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
  type WorkingTreeFileKind = import("@backend/WorkingTreeFileKind").WorkingTreeFileKind;
  type FileEntry = import("@backend/FileEntry").FileEntry & {
    kind?: WorkingTreeFileKind;
  };
  type WorkingTreeFileEntry = import("@backend/WorkingTreeFileEntry").WorkingTreeFileEntry;
  type LstreeEntry = import("@backend/LstreeEntry").LstreeEntry;
  type LstreeData = import("@backend/LstreeData").LstreeData;
  type CommitDetail = import("@backend/CommitDetail").CommitDetail;
  type CommitOptions = import("@backend/CommitOptions").CommitOptions;
  type CreateBranchOptions = import("@backend/CreateBranchOptions").CreateBranchOptions;
  type DeleteBranchOptions = import("@backend/DeleteBranchOptions").DeleteBranchOptions;
  type SwitchOptions = import("@backend/SwitchOptions").SwitchOptions;
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
  type ReflogRef = Extract<Ref, { type: "reflog" }>;

  interface Refs {
    head?: string;
    mergeHeads: string[];
    branches: BranchRef[];
    tags: TagRef[];
    remotes: Record<string, RemoteRef[]>;
    refsById: Record<string, Ref[]>;
  }

  interface DagNode {
    id: string;
    parentIds: string[];
  }

  type FileCommit = Commit & FileEntry;

  type WorkingTreeStat = Commit & {
    unmergedFiles: WorkingTreeFileEntry[];
    unstagedFiles: WorkingTreeFileEntry[];
    stagedFiles: WorkingTreeFileEntry[];
  };

  type LogDetail =
    | ({
        type: "commit";
      } & CommitDetail)
    | ({
        type: "status";
      } & WorkingTreeStat);

  interface Blame {
    commits: readonly FileCommit[];
    commitIds: readonly string[];
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
    name?: string;
    message: string;
    stack?: string;
  }

  type VoidReturn<T extends (...args: never[]) => unknown> = (...args: Parameters<T>) => void;
}
