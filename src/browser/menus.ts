import * as Electron from "electron";
import * as path from "path";
import { rendererActions } from "./actions";

export function openRepository(item: Electron.MenuItem, focusedWindow: Electron.BrowserWindow) {
    const paths = Electron.dialog.showOpenDialog(focusedWindow, {properties: ["openDirectory"]});
    if (typeof paths === "undefined") {
        return;
    }
    const repoPath = path.posix.join(paths[0].replace(/\\/g, "/"), ".git/");
    rendererActions.navigateToLog(focusedWindow.webContents, repoPath);
}

