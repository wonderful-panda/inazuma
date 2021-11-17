import cp from "child_process";
import {
  addToIndexAsync,
  commitAsync,
  filelogAsync,
  getCommitDetailAsync,
  lstreeAsync,
  removeFromIndexAsync
} from "inazuma-rust-backend";
import { config, environment } from "../persistent";
import { blame } from "../blame";
import wm from "../windowManager";
import { splitCommandline } from "../utils";
import { getTextFileContent as getTextFileContent_ } from "../file";
import {
  BrowserWindow,
  clipboard,
  dialog,
  IpcMainInvokeEvent,
  OpenDialogOptions,
  OpenDialogReturnValue
} from "electron";
import { openPty } from "../pty";
import { status } from "../status";
import { RepositorySessions } from "../repositorySession";

export { openRepository } from "./openRepository";
export { showExternalDiff } from "./showExternalDiff";

export type Handler<T extends unknown[], R> = (ctx: HandlerCtx, ...args: T) => Promise<R>;

export type SinglePayloadHandler<T, R> = Handler<[T], R>;

export interface HandlerCtx {
  event: IpcMainInvokeEvent;
  repositorySessions: RepositorySessions;
}

export const getLogDetail: SinglePayloadHandler<{ repoPath: string; sha: string }, LogDetail> =
  async (_, { repoPath, sha }) => {
    if (sha === "--") {
      const workingTreeStatus = await status(repoPath);
      return {
        type: "status",
        ...workingTreeStatus
      };
    } else {
      const commitDetail = await getCommitDetailAsync(repoPath, sha);
      return {
        type: "commit",
        ...commitDetail
      };
    }
  };

export const getBlame: SinglePayloadHandler<
  {
    repoPath: string;
    relPath: string;
    sha: string;
  },
  Blame
> = (_, { repoPath, relPath, sha }) => blame(repoPath, relPath, sha);

export const getFileLog: SinglePayloadHandler<
  {
    repoPath: string;
    relPath: string;
    sha: string;
  },
  FileCommit[]
> = (_, { repoPath, relPath, sha }) => filelogAsync(repoPath, relPath, 1000, [sha]);

export const getTree: SinglePayloadHandler<{ repoPath: string; sha: string }, LstreeEntry[]> =
  async (_, { repoPath, sha }) => lstreeAsync(repoPath, sha);

export const getConfig: Handler<[], Config> = () => Promise.resolve(config.data);

export const resetConfig: SinglePayloadHandler<Config, void> = (_, cfg) => {
  config.updateData(cfg);
  wm.emitEvent("configChanged", { config: cfg });
  return Promise.resolve();
};

export const runInteractiveShell: SinglePayloadHandler<string, void> = (_, cwd) => {
  const [command, ...args] = splitCommandline(config.data.interactiveShell);
  if (command) {
    cp.spawn(command, args, {
      cwd,
      detached: true,
      shell: true,
      stdio: "ignore"
    }).unref();
  }
  return Promise.resolve();
};

export const getTextFileContent: SinglePayloadHandler<
  {
    repoPath: string;
    file: FileSpec;
  },
  TextFile
> = (_, { repoPath, file }) => getTextFileContent_(repoPath, file);

export const addToIndex: SinglePayloadHandler<{ repoPath: string; relPath: string }, void> = (
  _,
  { repoPath, relPath }
) => addToIndexAsync(repoPath, relPath);

export const removeFromIndex: SinglePayloadHandler<{ repoPath: string; relPath: string }, void> = (
  _,
  { repoPath, relPath }
) => removeFromIndexAsync(repoPath, relPath);

export const commit: SinglePayloadHandler<{ repoPath: string; options: CommitOptions }, void> = (
  _,
  { repoPath, options }
) => commitAsync(repoPath, options);

export const copyTextToClipboard: SinglePayloadHandler<string, void> = (_, text) =>
  Promise.resolve(clipboard.writeText(text));

export const showOpenDialog: SinglePayloadHandler<OpenDialogOptions, OpenDialogReturnValue> =
  async (_, options) => {
    const parent = BrowserWindow.getFocusedWindow();
    return await (parent ? dialog.showOpenDialog(parent, options) : dialog.showOpenDialog(options));
  };

export const loadPersistentData: Handler<[], { config: Config; environment: Environment }> = () =>
  Promise.resolve({
    config: config.data,
    environment: environment.data
  });

export const saveEnvironment = async <K extends keyof Environment>(
  _: unknown,
  key: K,
  value: Environment[K]
) => {
  environment.updatePartial(key, value);
};

export const __openPty: SinglePayloadHandler<OpenPtyOptions, number> = ({ event }, options) =>
  Promise.resolve(openPty(event.sender, options));
