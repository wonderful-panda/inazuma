import * as Electron from "electron";

export function dispatchBrowser(type: keyof BrowserCommandPayload, payload: never): void;
export function dispatchBrowser<K extends keyof BrowserCommandPayload>(type: K, payload: BrowserCommandPayload[K]): void;

export function dispatchBrowser(type, payload) {
    Electron.ipcRenderer.send(type, payload);
}
