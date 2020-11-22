import { /* contextBridge, */ ipcRenderer } from "electron";

const keys: Record<keyof BrowserCommand, null> = {
  openRepository: null,
  getCommitDetail: null,
  getBlame: null,
  getFileLog: null,
  getTree: null,
  getConfig: null,
  resetConfig: null,
  runInteractiveShell: null,
  showExternalDiff: null,
  getTextFileContent: null,
  yankText: null,
  showContextMenu: null,
  showOpenDialog: null
};

type Handler = (...args: any[]) => Promise<any>;

const bridge = {} as Record<string, Handler>;
Object.keys(keys).forEach((key) => {
  bridge[key] = (...args: any[]) => ipcRenderer.invoke(key, ...args);
});

// This does not work yet. node-pty must be moved to browser process.
// contextBridge.exposeInMainWorld("api", bridge);

(window as any).api = bridge;

(window as any).addBrowserEventListener = <K extends keyof BrowserEvent>(
  type: K,
  listener: (payload: BrowserEvent[K]) => void
) => {
  ipcRenderer.on(type, (_event, payload: any) => listener(payload));
};
