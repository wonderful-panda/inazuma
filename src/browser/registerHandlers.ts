import { ipcMain, IpcMainInvokeEvent } from "electron";
import { Handler } from "./handlers";
import { RepositorySessions } from "./repositorySession";
// register each methods as Electron ipc handlers
const toSerializedError = (error: any): ErrorLike => ({
  name: error.name || "Unknown",
  message: error.message || `${error}`,
  stack: error.stack
});

export const registerHandlers = (
  repositorySessions: RepositorySessions,
  handlers: Record<string, Handler<any[], any>>
) => {
  Object.keys(handlers).forEach((key) => {
    const handler = handlers[key as keyof typeof handlers];
    ipcMain.handle(key, (event: IpcMainInvokeEvent, ...args: any[]) => {
      return handler({ event, repositorySessions }, ...args)
        .then((result): BrowserCommandResult => ({ status: "succeeded", result }))
        .catch((e): BrowserCommandResult => ({ status: "failed", error: toSerializedError(e) }));
    });
  });
};
