import * as _ from "lodash";
import * as ipcPromise from "ipc-promise";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs-extra";
import { config } from "./persistent";
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
      return ret;
    },
    async getCommitDetail({ repoPath, sha }): Promise<CommitDetail> {
      const detail = await getCommitDetail(repoPath, sha);
      return detail;
    },
    async getBlame({ repoPath, relPath, sha }): Promise<Blame> {
      const blame = await git.blame(repoPath, relPath, sha);
      return blame;
    },
    async getFileLog({ repoPath, relPath, sha }): Promise<FileCommit[]> {
      const ret = [] as FileCommit[];
      await git.filelog(repoPath, 100, [sha], relPath, c => ret.push(c));
      return ret;
    },
    getTree({ repoPath, sha }): Promise<LsTreeEntry[]> {
      return git.lsTree(repoPath, sha);
    },
    resetConfig(cfg: Config): Promise<void> {
      config.updateData(cfg);
      broadcast("configChanged", cfg);
      return Promise.resolve();
    },
    runInteractiveShell(cwd: string): Promise<void> {
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
    showExternalDiff({ repoPath, left, right }) {
      const rs = _repoSessions.prepare(repoPath);
      return showExternalDiff(rs, left, right);
    }
  };
  // register each methods as Electron ipc handlers
  Object.keys(bc).forEach(key => {
    const handler = (bc as any)[key] as (...args: any[]) => Promise<any>;
    ipcPromise.on(key, (arg: any) => {
      return handler(arg).catch(e => {
        throw _.toPlainObject(e);
      });
    });
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
  cp.spawn(command, args, {
    detached: true,
    shell: true,
    stdio: "ignore"
  }).unref();
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
    if (!(await fs.pathExists(parentDir))) {
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
