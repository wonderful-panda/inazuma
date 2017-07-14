import * as Electron from "electron";

class WindowManager {
    private _wins: { [id: string]: Electron.BrowserWindow } = {};

    create(opts?: Electron.BrowserWindowConstructorOptions): Electron.BrowserWindow {
        const win = new Electron.BrowserWindow(opts);
        const id = win.id;
        this._wins[id] = win;
        win.on("closed", () => {
            delete(this._wins[id]);
        });
        return win;
    }

    broadcast(type: string, payload: any) {
        Object.keys(this._wins).forEach(id => {
            this._wins[id].webContents.send("action", type, payload);
        });
    }
}

const wm = new WindowManager();
export default wm;
