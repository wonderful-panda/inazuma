import * as Electron from "electron";

/*
 * Proxy object to call browser actions
 */
export const browserActions: BrowserActions<void> = {
    openRepository(_, repoPath) {
        Electron.ipcRenderer.send("openRepository", repoPath);
    }
};

