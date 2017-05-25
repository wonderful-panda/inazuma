import * as Electron from "electron";
import * as _ from "lodash";
import * as ngit from "nodegit";
import * as path from "path";
import * as git from "./git";
import { environment } from "./persistentData";

const PSEUDO_COMMIT_ID_WTREE = "--";

export function dispatch<K extends keyof ActionPayload>(
        target: Electron.WebContents, type: K, payload: ActionPayload[K]) {
    target.send("action", type, payload);
}

type BrowserCommandHandler<K extends keyof BrowserCommandPayload> = (
        target: Electron.WebContents,
        payload: BrowserCommandPayload[K]) => void;

function registerCommand<K extends keyof BrowserCommandPayload>(type: K, handler: BrowserCommandHandler<K>) {
    Electron.ipcMain.on(type, (event, payload) => {
        console.log(type, payload);
        handler(event.sender, payload);
    });
}

export function setupBrowserCommands() {
    registerCommand("openRepository", async (target, repoPath) => {
        try {
            const commits = await fetchHistory(repoPath, 1000);
            if (environment.addRecentOpened(repoPath)) {
                dispatch(target, "environmentChanged", environment.data);
            }
            dispatch(target, "showCommits", commits);
        }
        catch (e) {
            console.log(e);
            dispatch(target, "error", e);
        }
    });
    registerCommand("getCommitDetail", async (target, { repoPath, sha }) => {
        try {
            const detail = await getCommitDetail(repoPath, sha);
            dispatch(target, "showCommitDetail", detail);
        }
        catch (e) {
            console.log(e);
            dispatch(target, "error", e);
        }
    });
};

function rawCommitToCommit(c: ngit.Commit): Commit {
    return <Commit>{
        id: c.sha(),
        parentIds: _.range(0, c.parentcount()).map(i => c.parentId(i).toString()),
        author: c.author().name(),
        summary: c.summary(),
        date: c.date().getTime()
    };
}

function getWtreePseudoCommit(head: ngit.Commit): Commit {
    return <Commit>{
        id: PSEUDO_COMMIT_ID_WTREE,
        parentIds: [head.sha()],
        author: "--",
        summary: "<Working tree>",
        date: new Date().getTime()
    };
}

async function fetchHistory(repoPath: string, num: number): Promise<Commit[]> {
    const repo = await git.openRepo(repoPath, true);
    const head = await repo.getHeadCommit();

    const rawCommits = await repo.fetchHistory([head], num);
    return [
        getWtreePseudoCommit(head),
        ...rawCommits.map(c => rawCommitToCommit(c))
    ];
}

async function getCommitDetail(repoPath: string, sha: string): Promise<CommitDetail> {
    const repo = await git.openRepo(repoPath, false);
    if (sha === PSEUDO_COMMIT_ID_WTREE) {
        const head = await repo.getHeadCommit();
        const status = await repo.getStatus();
        const files = status.map(f => {
            return {
                path: f.path(),
                status: f.status(),
                inIndex: f.inIndex() != 0,
                inWorkingTree: f.inWorkingTree() != 0
            };
        });
        return Object.assign(getWtreePseudoCommit(head), { body: "", files });
    }
    else {
        const { commit, patches } = await repo.getCommitDetail(sha);
        const body = commit.body();
        const files = patches.map(p => {
            return { path: p.newFile().path(), status: p.status() };
        });
        return Object.assign(rawCommitToCommit(commit), { body, files });
    }
}

