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
  ipcMain.removeHandler(`${type}:${token}`);
};

let currentToken = 1;
export const openPty = (sender: WebContents, options: OpenPtyOptions): number => {
  const token = currentToken;
  currentToken += 1;
  const { file, args, cwd } = options;
  const pty = spawn(file, args as string[], { cwd });
  installHandler("data", token, (data) => pty.write(data));
  installHandler("resize", token, (p) => pty.resize(p.cols, p.rows));
  installHandler("kill", token, (p) => pty.kill(p.signal));
  pty.onData((data) => sendToRenderer(sender, "data", token, data));
  pty.onExit((p) => {
    uninstallHandler("data", token);
    uninstallHandler("resize", token);
    uninstallHandler("kill", token);
    sendToRenderer(sender, "exit", token, p);
  });
  return token;
};
