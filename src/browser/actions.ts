import * as Electron from "electron";
import * as _ from "lodash";
import * as path from "path";
import * as git from "./git";
import { Commit } from "../types";

const ipcMain = Electron.ipcMain;

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

export function openRepository(repoPath: string, target: Electron.WebContents) {
    fetchHistory(repoPath, 1000).then(commits => {
        target.send("COMMITS", commits);
    }).catch(e => {
        console.log(e);
        target.send("ERROR", e);
    });
}
ipcMain.on(openRepository.name, (event: Electron.IpcMainEvent, repoPath: string) => {
    openRepository(repoPath, event.sender);
})
