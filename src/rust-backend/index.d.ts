declare interface Commit {
  id: string;
  parentIds: string[];
  summary: string;
  date: number;
  author: string;
}

declare interface FileEntry {
  path: string;
  oldPath?: string;
  statusCode: string;
  insertions?: number | "-";
  deletions?: number | "-";
}

declare interface CommitDetail extends Commit {
  body: string;
  files: FileEntry[];
}

declare interface FileLogEntry extends Commit {
  path: string;
  oldPath?: string;
  statusCode: string;
}

declare type LstreeEntry = {
  data: {
    type: "blob" | "tree";
    path: string;
  };
  children?: LstreeEntry[];
};

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
  remotes: Record<string, RemoteRef[]>;
  heads: BranchRef[];
  tags: TagRef[];
}

declare interface BlameEntry {
  id: string;
  lineNo: number[];
}

declare type CommitOptions =
  | {
      amend?: false;
      message: string;
    }
  | {
      amend: true;
      message?: string;
    };

export declare function logAsync(repoPath: string, maxCount: number): Promise<Commit[]>;

export declare function filelogAsync(
  repoPath: string,
  relPath: string,
  maxCount: number,
  heads: readonly string[]
): Promise<FileLogEntry[]>;

export declare function getCommitDetailAsync(
  repoPath: string,
  revspec: string
): Promise<CommitDetail>;

export declare function getWorkingTreeStatAsync(
  repoPath: string,
  cached: boolean
): Promise<FileEntry[]>;

export declare function getChangesBetweenAsync(
  repoPath: string,
  revspec1: string,
  revspec2: string
): Promise<FileEntry[]>;

export declare function getUntrackedFilesAsync(repoPath: string): Promise<string[]>;

export declare function getWorkingTreeParentsAsync(repoPath: string): Promise<string[]>;

export declare function lstreeAsync(repoPath: string, sha: string): Promise<LstreeEntry[]>;

export declare function refsAsync(repoPath: string): Promise<Refs>;

export declare function blameAsync(
  repoPath: string,
  relPath: string,
  sha: string
): Promise<BlameEntry[]>;

export declare function getContentAsync(
  repoPath: string,
  relPath: string,
  sha: string
): Promise<Buffer>;

export declare function saveToAsync(
  repoPath: string,
  relPath: string,
  sha: string,
  destPath: string
): Promise<void>;

export declare function addToIndexAsync(repoPath: string, relPath: string): Promise<void>;

export declare function removeFromIndexAsync(repoPath: string, relPath: string): Promise<void>;

export declare function commitAsync(
  repoPath: string,
  options: { amend?: false; message: string } | { amend: true; message?: string }
): Promise<void>;

export declare function findRepositoryRootAsync(): Promise<string | undefined>;
