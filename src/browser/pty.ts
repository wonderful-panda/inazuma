import { ipcMain, WebContents } from "electron";
import { spawn } from "node-pty";

const sendToRenderer = <K extends keyof PtyEvents>(
  sender: WebContents,
  type: K,
  token: number,
  payload: PtyEvents[K]
) => {
  sender.send(`${type}:${token}`, payload);
};

const installHandler = <K extends keyof PtyCommands>(
  type: K,
  token: number,
  handler: (payload: PtyCommands[K]) => void
) => {
  ipcMain.handle(`${type}:${token}`, (_event, payload) => handler(payload));
};

const uninstallHandler = <K extends keyof PtyCommands>(type: K, token: number) => {
  ipcMain.removeAllListeners(`${type}:${token}`);
};

export const openPty = (sender: WebContents, options: OpenPtyOptions & { token: number }) => {
  const { file, args, cwd, token } = options;
  const pty = spawn(file, args as string[], { cwd });
  installHandler("data", token, (data) => pty.write(data));
  installHandler("resize", token, (p) => pty.resize(p.cols, p.rows));
  installHandler("kill", token, (p) => pty.kill(p.signal));
  pty.onData((data) => sendToRenderer(sender, "data", options.token, data));
  pty.onExit((p) => {
    uninstallHandler("data", token);
    uninstallHandler("resize", token);
    uninstallHandler("kill", token);
    sendToRenderer(sender, "exit", options.token, p);
  });
};
