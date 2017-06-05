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
    status: number;
    inIndex?: boolean;
    inWorkingTree?: boolean;
}

declare interface CommitDetail extends Commit {
    body: string;
    files: FileEntry[];
}

/**
 * Type of each Vuex action payload.
 * Vuex actions run in renderer process, and can be dispatched from
 * both renderer and browser processes.
 */
declare interface ActionPayload {
    error: any;
    environmentChanged: Environment;
    showRepositorySelectDialog: null;
    navigateToLog: string;
    navigateToRoot: null;
    showCommits: Commit[];
    showCommitDetail: CommitDetail;
    setSelectedIndex: number;
}

/**
 * Type of each browser command payload.
 * Browser commands run in browser process, and can be dispatched from
 * both browser and renderer processes
 */
declare interface BrowserCommandPayload {
    openRepository: string;
    getCommitDetail: { repoPath: string, sha: string };
}

