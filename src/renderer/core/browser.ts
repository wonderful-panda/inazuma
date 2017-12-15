import * as Electron from "electron";
import * as ipcPromise from "ipc-promise";

export const browserCommand = new Proxy({}, {
    get: function(target, name: string) {
        return (params: any) => ipcPromise.send(name, params);
    }
}) as BrowserCommand;
