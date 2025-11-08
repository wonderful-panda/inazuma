import { atom, createStore } from "jotai";
import { atomFamily } from "jotai/utils";
import type { GraphFragment } from "@/grapher";
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
