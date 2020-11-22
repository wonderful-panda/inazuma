import Electron from "electron";

class WindowManager {
  private _wins: Dict<Electron.BrowserWindow> = {};

  create(opts?: Electron.BrowserWindowConstructorOptions): Electron.BrowserWindow {
    const win = new Electron.BrowserWindow(opts);
    const id = win.id;
    this._wins[id] = win;
    win.on("closed", () => {
      delete this._wins[id];
    });
    return win;
  }

  emitEvent<K extends keyof BrowserEvent>(type: K, payload: BrowserEvent[K]) {
    Object.keys(this._wins).forEach((id) => {
      this._wins[id].webContents.send(type, payload);
    });
  }
}

const wm = new WindowManager();
export default wm;
