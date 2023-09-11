import { atom } from "jotai";
import { repoPathAtom } from ".";

const _workingTreeAtom = atom<WorkingTreeStat | undefined>(undefined);

export const workingTreeAtom = atom(
  (get) => get(_workingTreeAtom),
  (get, set, update: { repoPath: string; value: WorkingTreeStat } | undefined) => {
    if (!update) {
      set(_workingTreeAtom, update);
    } else if (get(repoPathAtom) === update.repoPath) {
      set(_workingTreeAtom, update.value);
    }
  }
);
