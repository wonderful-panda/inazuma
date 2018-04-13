import * as ipcPromise from "ipc-promise";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs-extra";
import { environment, config } from "./persistent";
import { splitCommandline, randomName } from "./utils";
import git from "./git";
import wm from "./windowManager";
import { RepositorySessions, RepositorySession } from "./repositorySession";

const PSEUDO_COMMIT_ID_WTREE = "--";

export function broadcast<K extends keyof BroadcastAction>(
  type: K,
  payload: BroadcastAction[K]
) {
  wm.broadcast(type, payload);
}

export function setupBrowserCommands(
  _repoSessions: RepositorySessions
): BrowserCommand {
  const bc: BrowserCommand = {
    async openRepository(
      repoPath: string
    ): Promise<{ commits: Commit[]; refs: Refs }> {
      const ret = await fetchHistory(repoPath, 1000);
      if (environment.addRecentOpened(repoPath)) {
        broadcast("environmentChanged", environment.data);
      }
      return ret;
    },
    async getCommitDetail({ repoPath, sha }): Promise<CommitDetail> {
      const detail = await getCommitDetail(repoPath, sha);
      return detail;
    },
    resetConfig(cfg: Config): Promise<void> {
      config.updateData(cfg);
      broadcast("configChanged", cfg);
      return Promise.resolve();
    },
    runInteractiveShell(cwd: string): Promise<void> {
      const [command, ...args] = splitCommandline(config.data.interactiveShell);
      if (command) {
        cp
          .spawn(command, args, {
            cwd,
            detached: true,
            shell: true,
            stdio: "ignore"
          })
          .unref();
      }
      return Promise.resolve();
    },
    showExternalDiff({ repoPath, left, right }) {
      const rs = _repoSessions.prepare(repoPath);
      return showExternalDiff(rs, left, right);
    },
    saveDisplayState(displayState: { [name: string]: any }): Promise<void> {
      environment.data.displayState = Object.assign(
        environment.data.displayState || {},
        displayState
      );
      return Promise.resolve();
    }
  };
  // register each methods as Electron ipc handlers
  Object.keys(bc).forEach(key => {
    ipcPromise.on(key, (bc as any)[key]);
  });
  return bc;
}

function getWtreePseudoCommit(
  headId: string | undefined,
  mergeHeads: string[]
): Commit {
  return {
    id: PSEUDO_COMMIT_ID_WTREE,
    parentIds: headId ? [headId, ...mergeHeads] : mergeHeads,
    author: "--",
    summary: "<Working tree>",
    date: new Date().getTime()
  };
}

async function fetchHistory(
  repoPath: string,
  num: number
): Promise<{ commits: Commit[]; refs: Refs }> {
  const refs = await git.getRefs(repoPath);
  const headId = refs.head;

  const commits = headId ? [getWtreePseudoCommit(headId, refs.mergeHeads)] : [];
  await git.log(repoPath, num, Object.keys(refs.refsById), commit => {
    commits.push(commit);
  });
  return { commits, refs };
}

async function getCommitDetail(
  repoPath: string,
  sha: string
): Promise<CommitDetail> {
  if (sha === PSEUDO_COMMIT_ID_WTREE) {
    const refs = await git.getRefs(repoPath);
    const files = await git.status(repoPath);
    return Object.assign(getWtreePseudoCommit(refs.head, refs.mergeHeads), {
      body: "",
      files
    });
  } else {
    const commits = await git.getCommitDetail(repoPath, sha);
    return commits;
  }
}

async function showExternalDiff(
  rs: RepositorySession,
  left: DiffFile,
  right: DiffFile
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
  cp
    .spawn(command, args, {
      detached: true,
      shell: true,
      stdio: "ignore"
    })
    .unref();
}

async function prepareDiffFile(
  rs: RepositorySession,
  file: DiffFile
): Promise<string> {
  if (file.sha === "UNSTAGED") {
    // use file in the repository directly
    return path.join(rs.repoPath, file.path);
  }

  let absPath: string;
  if (file.sha === "STAGED") {
    const fileName = path.basename(file.path);
    const tempFileName = `STAGED-${randomName(6)}-${fileName}`;
    // TODO: check file name conflict
    absPath = path.join(rs.tempdir, tempFileName);
  } else {
    // TODO: shorten path
    absPath = path.join(rs.tempdir, file.sha, file.path);
    const parentDir = path.dirname(absPath);
    if (!await fs.pathExists(parentDir)) {
      await fs.mkdirs(parentDir);
    }
  }
  if (await fs.pathExists(absPath)) {
    return absPath;
  }
  await git.saveTo(rs.repoPath, file.path, file.sha, absPath);
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
