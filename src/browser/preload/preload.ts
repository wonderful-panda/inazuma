import { contextBridge, ipcRenderer } from "electron";

const keys: Record<keyof BrowserCommand, null> = {
  openRepository: null,
  getLogDetail: null,
  getBlame: null,
  getFileLog: null,
  getTree: null,
  getConfig: null,
  resetConfig: null,
  runInteractiveShell: null,
  showExternalDiff: null,
  getTextFileContent: null,
  yankText: null,
  showOpenDialog: null,
  loadPersistentData: null,
  saveEnvironment: null,
  __openPty: null
};

const bridge = {} as BrowserCommand;
Object.keys(keys).forEach((key) => {
  (bridge as any)[key] = async (...args: any[]) => {
    const ret: BrowserCommandResult = await ipcRenderer.invoke(key, ...args);
    console.log(key, ret);
    if (ret.status === "succeeded") {
      return ret.result;
    } else {
      console.error(ret.error);
      throw ret.error;
    }
  };
});

const expose = <K extends keyof RendererGlobals>(name: K, value: RendererGlobals[K]) => {
  contextBridge.exposeInMainWorld(name, value);
};

expose("browserApi", bridge);

expose("browserEvents", {
  listen: (type, listener) => {
    ipcRenderer.on(type, (_event, payload: any) => listener(payload));
  }
});

const listenPtyEvent = <K extends keyof PtyEvents>(
  type: K,
  token: number,
  listener: (payload: PtyEvents[K]) => void
) => {
  ipcRenderer.on(`${type}:${token}`, (_, payload) => listener(payload));
};

const invokePtyCommand = <K extends keyof PtyCommands>(
  type: K,
  token: number,
  payload: PtyCommands[K]
): Promise<void> => {
  return ipcRenderer.invoke(`${type}:${token}`, payload);
};

const openPty = async (
  options: OpenPtyOptions,
  listeners: PtyListeners
): Promise<{ [K in keyof PtyCommands]: (payload: PtyCommands[K]) => Promise<void> }> => {
  const token = await bridge.__openPty(options);
  listenPtyEvent("data", token, listeners.onData);
  listenPtyEvent("exit", token, listeners.onExit);
  return {
    data: (data) => invokePtyCommand("data", token, data),
    resize: (payload) => invokePtyCommand("resize", token, payload),
    kill: () => invokePtyCommand("kill", token, {})
  };
};

expose("pty", { open: openPty });
