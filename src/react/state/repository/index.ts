import { GraphFragment } from "@/grapher";
import { atom } from "jotai";
import { resetRepoTabsAtom, repoTabsAtom } from "./tabs";
import { resetDialogAtom } from "./dialog";
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
    set(resetDialogAtom);
    if (!keepTabs) {
      set(repoTabsAtom, {
        tabs: [{ type: "commits", title: "COMMITS", id: "__COMMITS__", closable: false }],
        currentIndex: 0
      });
    }
  }
);

export const closeRepositoryAtom = atom(null, (_get, set) => {
  set(_repoPathAtom, "");
  set(logAtom, undefined);
  set(commitDetailAtom, undefined);
  set(workingTreeAtom, undefined);
  set(resetRepoTabsAtom);
  set(resetDialogAtom);
});

export const setCommitDetailAtom = atom(
  null,
  (get, set, update: { repoPath: string; value: CommitDetail }) => {
    if (get(_repoPathAtom) === update.repoPath) {
      set(commitDetailAtom, update.value);
    }
  }
);
