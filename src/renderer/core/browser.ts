import * as ipcPromise from "ipc-promise";

export const browserCommand = new Proxy({}, {
    get: function(_target, name: string) {
        return (params: any) => ipcPromise.send(name, params);
    }
}) as BrowserCommand;
