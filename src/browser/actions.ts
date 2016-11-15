import * as Electron from "electron";
import * as _ from "lodash";
import * as ngit from "nodegit";
import * as path from "path";
import * as git from "./git";
import { environment } from "./persistentData";

function sendRenderer(target: Electron.WebContents, name: string, payload?: any) {
    target.send("action", name, payload);
}

/**
 * Proxy object to pass action/payload to Vuex via ipc
 */
export const rendererActions: RendererActions<Electron.WebContents> = {
    error(ctx, e: any) {
        sendRenderer(ctx, "error", e);
    },
    environmentChanged(ctx, env) {
        sendRenderer(ctx, "environmentChanged", env);
    },
    selectRepository(ctx) {
        sendRenderer(ctx, "selectRepository");
    },
    navigateToLog(ctx, repoPath) {
        sendRenderer(ctx, "navigateToLog", repoPath);
    },
    navigateToRoot(ctx) {
        sendRenderer(ctx, "navigateToRoot");
    },
    showCommits(ctx, commits) {
        sendRenderer(ctx, "showCommits", commits);
    },
    showCommitDetail(ctx, commit) {
        sendRenderer(ctx, "showCommitDetail", commit);
    }
};

const browserActions: BrowserActions<Electron.WebContents> = {
    async openRepository(ctx, repoPath) {
        try {
            const commits = await fetchHistory(repoPath, 1000);
            if (environment.addRecentOpened(repoPath)) {
                rendererActions.environmentChanged(ctx, environment.data);
            }
            rendererActions.showCommits(ctx, commits);
        }
        catch (e) {
            console.log(e);
            rendererActions.error(ctx, e);
        }
    },
    async getCommitDetail(ctx, repoPath: string, sha: string) {
        try {
            const detail = await getCommitDetail(repoPath, sha);
            rendererActions.showCommitDetail(ctx, detail);
        }
        catch (e) {
            console.log(e);
            rendererActions.error(ctx, e);
        }
    }
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

async function fetchHistory(repoPath: string, num: number): Promise<Commit[]> {
    const rawCommits = await git.fetchHistory(repoPath, num);
    return rawCommits.map(c => rawCommitToCommit(c));
}

async function getCommitDetail(repoPath: string, sha: string): Promise<CommitDetail> {
    const { commit, patches } = await git.getCommitDetail(repoPath, sha);
    const body = commit.body();
    const files = patches.map(p => {
        return { path: p.newFile().path(), status: p.status() };
    });
    return Object.assign(rawCommitToCommit(commit), { body, files });
}

export function setupBrowserActions() {
    const ipc = Electron.ipcMain;
    Object.getOwnPropertyNames(browserActions).forEach((name) => {
        const f = <Function>browserActions[name];
        ipc.on(name, (event, ...arg) => {
            console.log(name, arg);
            f(event.sender, ...arg);
        });
    });
}

