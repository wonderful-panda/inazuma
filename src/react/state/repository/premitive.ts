import { TabDefinition } from "@/components/TabContainer";
import { GraphFragment } from "@/grapher";
import { atom } from "jotai";

export interface CommitLogItems {
  commits: Commit[];
  refs: Refs;
  graph: Record<string, GraphFragment>;
}
export const repoPathAtom = atom<string | undefined>(undefined);
export const logAtom = atom<CommitLogItems | undefined>(undefined);
export const commitDetailAtom = atom<CommitDetail | undefined>(undefined);
export const workingTreeAtom = atom<WorkingTreeStat | undefined>(undefined);

export type TabType = {
  commits: null;
  tree: {
    commit: Commit;
  };
  commitDiff: {
    commit1: Commit;
    commit2: Commit;
  };
  file: {
    commit: Commit;
    path: string;
  };
};

export type RepositoryTab = TabDefinition<TabType>;
export type TabsState = { tabs: RepositoryTab[]; currentIndex: number };

export const tabsAtom = atom<TabsState>({ tabs: [], currentIndex: -1 });

export type DialogParam =
  | { type: "Commit" }
  | { type: "NewBranch"; commitId: string }
  | { type: "DeleteBranch"; branchName: string };

export type DialogState = {
  opened: boolean;
  param: DialogParam | undefined;
  version: number;
};

export const activeDialogAtom = atom<DialogState>({ version: 0, opened: false, param: undefined });
