import { atom, createStore } from "jotai";
import { atomFamily } from "jotai/utils";
import type { GraphFragment } from "@/grapher";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import type { RepositoryConfig } from "@backend/RepositoryConfig";
import { resetRepoTabsAtom } from "./tabs";
import { workingTreeAtom } from "./workingtree";

export interface CommitLogItems {
  commits: Commit[];
  refs: Refs;
  graph: Record<string, GraphFragment>;
}
export const logAtom = atom<CommitLogItems | undefined>(undefined);
export const commitDetailAtom = atom<CommitDetail | undefined>(undefined);

const _repoPathAtom = atom<string>("");
export const repoPathAtom = atom((get) => get(_repoPathAtom));

export const createRepositoryStore = (path: string) => {
  const store = createStore();
  store.set(_repoPathAtom, path);
  return store;
};

export const repositoryStoresAtomFamily = atomFamily((path: string) =>
  atom(createRepositoryStore(path))
);

export const setLogAtom = atom(
  null,
  (
    _get,
    set,
    update: {
      path: string;
      keepTabs: boolean;
      commits: Commit[];
      refs: Refs;
      graph: Record<string, GraphFragment>;
    }
  ) => {
    const { path, keepTabs, commits, refs, graph } = update;
    set(_repoPathAtom, path);
    set(logAtom, { commits, refs, graph });
    set(commitDetailAtom, undefined);
    set(workingTreeAtom, undefined);
    if (!keepTabs) {
      set(resetRepoTabsAtom);
    }
  }
);

export const currentBranchAtom = atom((get) => {
  return get(logAtom)?.refs.branches?.find((b) => b.current);
});

export const setCommitDetailAtom = atom(
  null,
  (get, set, update: { repoPath: string; value: CommitDetail }) => {
    if (get(_repoPathAtom) === update.repoPath) {
      set(commitDetailAtom, update.value);
    }
  }
);

/**
 * Repository-specific configuration
 */
export const repoConfigAtom = atom<RepositoryConfig | undefined>(undefined);

export const loadRepoConfigAtom = atom(null, async (get, set) => {
  const repoPath = get(_repoPathAtom);
  if (!repoPath) {
    set(repoConfigAtom, undefined);
    return;
  }
  try {
    const config = await invokeTauriCommand("load_repo_config", { repoPath });
    set(repoConfigAtom, config);
  } catch (error) {
    console.error("Failed to load repository config:", error);
    set(repoConfigAtom, { customCommands: [] });
  }
});

export const saveRepoConfigAtom = atom(null, async (get, set, newConfig: RepositoryConfig) => {
  const repoPath = get(_repoPathAtom);
  if (!repoPath) {
    throw new Error("No repository path set");
  }
  await invokeTauriCommand("save_repo_config", { repoPath, newConfig });
  set(repoConfigAtom, newConfig);
});
