import * as ipcPromise from "ipc-promise";
import * as cp from "child_process";
import { environment, config } from "./persistentData";
import { splitCommandline } from "./utils";
import git from "./git";
import wm from "./windowManager";

const PSEUDO_COMMIT_ID_WTREE = "--";

export function broadcast<K extends keyof BroadcastAction>(
  type: K,
  payload: BroadcastAction[K]
) {
  wm.broadcast(type, payload);
}

const browserCommand: BrowserCommand = {
  async openRepository(
    repoPath: string
  ): Promise<{ commits: Commit[]; refs: Refs }> {
    const ret = await fetchHistory(repoPath, 1000);
    if (environment.addRecentOpened(repoPath)) {
      broadcast("environmentChanged", environment.data);
    }
    return ret;
  },
  async getCommitDetail(arg: {
    repoPath: string;
    sha: string;
  }): Promise<CommitDetail> {
    const detail = await getCommitDetail(arg.repoPath, arg.sha);
    return detail;
  },
  resetConfig(cfg: Config): Promise<null> {
    config.data = cfg;
    broadcast("configChanged", cfg);
    return Promise.resolve(null);
  },
  runInteractiveShell(cwd: string): Promise<null> {
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
    return Promise.resolve(null);
  }
};

export function setupBrowserCommands() {
  Object.keys(browserCommand).forEach(key => {
    ipcPromise.on(key, (browserCommand as any)[key]);
  });
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
