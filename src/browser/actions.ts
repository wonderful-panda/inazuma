import { BrowserWindow, clipboard, dialog, ipcMain, IpcMainInvokeEvent } from "electron";
import cp from "child_process";
import path from "path";
import fs from "fs-extra";
import { config } from "./persistent";
import { splitCommandline, randomName } from "./utils";
import wm from "./windowManager";
import { RepositorySessions, RepositorySession } from "./repositorySession";
import { openPty } from "./pty";
import { blame } from "./blame";
import { getTextFileContent, saveTo } from "./file";
import { logAsync, filelogAsync, refsAsync, getCommitDetailAsync, lstreeAsync } from "inazuma-rust-backend";
import { status } from "./status";

const PSEUDO_COMMIT_ID_WTREE = "--";

type BrowserCommandHandlers = {
  [K in keyof BrowserCommand]: (
    event: IpcMainInvokeEvent,
    ...args: Parameters<BrowserCommand[K]>
  ) => ReturnType<BrowserCommand[K]>;
};

export function setupBrowserCommands(_repoSessions: RepositorySessions): BrowserCommandHandlers {
  const bc: BrowserCommandHandlers & ThisType<void> = {
    async openRepository(_, repoPath: string): Promise<{ commits: Commit[]; refs: Refs }> {
      const ret = await fetchHistory(repoPath, 1000);
      return ret;
    },
    async getLogDetail(_, { repoPath, sha }): Promise<LogDetail> {
      return await getLogDetail(repoPath, sha);
    },
    async getBlame(_, { repoPath, relPath, sha }): Promise<Blame> {
      return await blame(repoPath, relPath, sha);
    },
    async getFileLog(_, { repoPath, relPath, sha }): Promise<FileCommit[]> {
      const ret = await filelogAsync(repoPath, relPath, 100, [sha]);
      return ret;
    },
    getTree(_, { repoPath, sha }): Promise<LstreeEntry[]> {
      return lstreeAsync(repoPath, sha);
    },
    async getConfig(_): Promise<Config> {
      return config.data;
    },
    resetConfig(_, cfg: Config): Promise<void> {
      config.updateData(cfg);
      wm.emitEvent("configChanged", { config: cfg });
      return Promise.resolve();
    },
    runInteractiveShell(_, cwd: string): Promise<void> {
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
    },
    showExternalDiff(_, { repoPath, left, right }) {
      const rs = _repoSessions.prepare(repoPath);
      return showExternalDiff(rs, left, right);
    },
    getTextFileContent(_, { repoPath, file }) {
      return getTextFileContent(repoPath, file);
    },
    async yankText(_, text) {
      clipboard.writeText(text);
    },
    async showOpenDialog(_, options) {
      const parent = BrowserWindow.getFocusedWindow();
      try {
        const result = await (parent
          ? dialog.showOpenDialog(parent, options)
          : dialog.showOpenDialog(options));
        return result;
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
    async __openPty(event, options) {
      openPty(event.sender, options);
    }
  };
  // register each methods as Electron ipc handlers
  Object.keys(bc).forEach((key) => {
    const handler = bc[key as keyof BrowserCommandHandlers] as (...args: any[]) => Promise<any>;
    ipcMain.handle(key, handler);
  });
  return bc;
}

function getWtreePseudoCommit(headId: string | undefined, mergeHeads: string[]): Commit {
  return {
    id: PSEUDO_COMMIT_ID_WTREE,
    parentIds: headId ? [headId, ...mergeHeads] : mergeHeads,
    author: "--",
    summary: "<Working tree>",
    date: new Date().getTime()
  };
}

async function getRefs(repoPath: string): Promise<Refs> {
  const refs_ = await refsAsync(repoPath);
  const refs: Refs = {
    ...refs_,
    refsById: {}
  };
  if (refs.head) {
    refs.refsById[refs.head] = [{ id: refs.head, type: "HEAD", fullname: "HEAD" }];
  }
  const remotes = Object.values(refs.remotes).reduce((prev, cur) => {
    prev.push(...cur);
    return prev;
  }, [] as Ref[]);
  const sortedHeads = refs.heads.sort((a, b) => {
    if (a.current) {
      return -1;
    } else if (b.current) {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
  for (const r of [...sortedHeads, ...refs.tags, ...remotes]) {
    (refs.refsById[r.id] || (refs.refsById[r.id] = [])).push(r);
  }
  return refs;
}

async function fetchHistory(
  repoPath: string,
  num: number
): Promise<{ commits: Commit[]; refs: Refs }> {
  const [refs, commits] = await Promise.all([getRefs(repoPath), logAsync(repoPath, num)]);
  if (refs.head) {
    commits.unshift(getWtreePseudoCommit(refs.head, refs.mergeHeads));
  }
  return { commits, refs };
}

async function getLogDetail(repoPath: string, sha: string): Promise<LogDetail> {
  if (sha === PSEUDO_COMMIT_ID_WTREE) {
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
}

async function showExternalDiff(
  rs: RepositorySession,
  left: FileSpec,
  right: FileSpec
): Promise<void> {
  const externalDiffTool = config.data.externalDiffTool;
  if (!externalDiffTool) {
    return;
  }
  const [command, ...args] = splitCommandline(externalDiffTool);
  const [leftPath, rightPath] = await Promise.all([
    prepareDiffFile(rs, left),
    prepareDiffFile(rs, right)
  ]);
  replaceOrPush(args, "%1", leftPath);
  replaceOrPush(args, "%2", rightPath);
  cp.spawn(command, args, {
    detached: true,
    shell: true,
    stdio: "ignore"
  }).unref();
}

async function prepareDiffFile(rs: RepositorySession, file: FileSpec): Promise<string> {
  if (file.revspec === "UNSTAGED") {
    // use file in the repository directly
    return path.join(rs.repoPath, file.path);
  }

  let absPath: string;
  if (file.revspec === "STAGED") {
    const fileName = path.basename(file.path);
    const tempFileName = `STAGED-${randomName(6)}-${fileName}`;
    // TODO: check file name conflict
    absPath = path.join(rs.tempdir, tempFileName);
  } else {
    // TODO: shorten path
    absPath = path.join(rs.tempdir, file.revspec, file.path);
    const parentDir = path.dirname(absPath);
    if (!(await fs.pathExists(parentDir))) {
      await fs.mkdirs(parentDir);
    }
  }
  if (await fs.pathExists(absPath)) {
    return absPath;
  }
  await saveTo(rs.repoPath, file, absPath);
  return absPath;
}

function replaceOrPush(array: string[], value: string, newValue: string): void {
  const index = array.indexOf(value);
  if (index < 0) {
    array.push(newValue);
  } else {
    array[index] = newValue;
  }
}
