import * as Electron from "electron";
import * as _ from "lodash";
import * as path from "path";
import * as git from "./git";
import { environment } from "./persistentData";

function sendRenderer(target: Electron.WebContents, name: string, payload: any) {
    target.send("action", name, payload);
}

/**
 * Proxy object to pass action/payload to Vuex via ipc
 */
export const rendererActions: RendererActions<Electron.WebContents> = {
    error(ctx, e: any) {
        sendRenderer(ctx, "error", e);
    },
    navigateToLog(ctx, repoPath) {
        sendRenderer(ctx, "navigateToLog", repoPath);
    },
    showCommits(ctx, commits) {
        sendRenderer(ctx, "showCommits", commits);
    }
};

const browserActions: BrowserActions<Electron.WebContents> = {
    openRepository(ctx, repoPath) {
        fetchHistory(repoPath, 1000).then(commits => {
            rendererActions.showCommits(ctx, commits);
        }).catch(e => {
            console.log(e);
            rendererActions.error(ctx, e);
        });
    }
};

function fetchHistory(repoPath: string, num: number): Promise<Commit[]> {
    return git.fetchHistory(repoPath, num).then(rawCommits => {
        return rawCommits.map(c => {
            return <Commit>{
                id: c.sha(),
                parentIds: _.range(0, c.parentcount()).map(i => c.parentId(i).toString()),
                author: c.author().name(),
                summary: c.summary(),
                date: c.date()
            };
        });
    });
}

export function setupBrowserActions() {
    const ipc = Electron.ipcMain;
    Object.getOwnPropertyNames(browserActions).forEach((name) => {
        const f = <Function>browserActions[name];
        ipc.on(name, (event, arg) => {
            console.log(name, arg);
            f(event.sender, arg);
        });
    });
}

