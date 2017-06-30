/*
 * Type definitions needed by both browser and renderer
 */

/**
 * Auto updated parsistent data written to .environment.json
 */
declare interface Environment {
    recentOpened: string[];
}

/**
 * User specific parsistent data written to config.json
 */
declare interface Config {
    recentListCount: number;
}

declare type Ref = {
    type: "HEAD" | "MERGE_HEAD",
    id: string
} | {
    type: "heads",
    name: string,
    id: string,
    current: boolean
} | {
    type: "tags",
    name: string,
    id: string
} | {
    type: "remotes",
    remote: string,
    name: string,
    id: string
};

declare interface DagNode {
    id: string;
    parentIds: string[];
}

declare interface Commit extends DagNode {
    summary: string;
    date: number;
    author: string;
    refs?: Ref[];
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

declare interface BrowserCommand {
    openRepository(repoPath: string): Promise<Commit[]>;
    getCommitDetail(params: { repoPath: string, sha: string }): Promise<CommitDetail>;
    resetConfig(config: Config): Promise<null>;
}

