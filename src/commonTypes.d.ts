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
    date: Date;
    author: string;
}

/**
 * Browser process methods which can be called from renderer process.
 */
declare interface BrowserActions<T> {
    openRepository(ctx: T, repoPath: string): void;
}


