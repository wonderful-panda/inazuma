import * as Electron from "electron";
import * as _ from "lodash";
import * as ipcPromise from "ipc-promise";
import * as path from "path";
import { environment } from "./persistentData";
import git from "./git/index";
import wm from "./windowManager";

const PSEUDO_COMMIT_ID_WTREE = "--";

export function broadcast<K extends keyof BroadcastAction>(
    type: K, payload: BroadcastAction[K]) {
    wm.broadcast(type, payload);
}

const browserCommand: BrowserCommand = {
    async openRepository(repoPath: string): Promise<Commit[]> {
        const commits = await fetchHistory(repoPath, 1000);
        if (environment.addRecentOpened(repoPath)) {
            broadcast("environmentChanged", environment.data);
        }
        return commits;
    },
    async getCommitDetail(arg: { repoPath: string, sha: string }): Promise<CommitDetail> {
        const detail = await getCommitDetail(arg.repoPath, arg.sha);
        return detail;
    }
};

export function setupBrowserCommands() {
    Object.keys(browserCommand).forEach(key => {
        ipcPromise.on(key, browserCommand[key]);
    })
}

function getWtreePseudoCommit(headId: string): Commit {
    return <Commit>{
        id: PSEUDO_COMMIT_ID_WTREE,
        parentIds: [headId],
        author: "--",
        summary: "<Working tree>",
        date: new Date().getTime()
    };
}

async function fetchHistory(repoPath: string, num: number): Promise<Commit[]> {
    const refs = await git.getRefs(repoPath);
    const headId = refs.head;

    const commits = [getWtreePseudoCommit(headId)];
    const ret = await git.log(repoPath, num, refs.getAllIds(), commit => {
        commit.refs = refs.getRefsById(commit.id);
        commits.push(commit);
    });
    return commits;
}

async function getCommitDetail(repoPath: string, sha: string): Promise<CommitDetail> {
    if (sha === PSEUDO_COMMIT_ID_WTREE) {
        const refs = await git.getRefs(repoPath);
        const files = await git.status(repoPath);
        return Object.assign(getWtreePseudoCommit(refs.head), { body: "", files });
    }
    else {
        return await git.getCommitDetail(repoPath, sha);
    }
}

