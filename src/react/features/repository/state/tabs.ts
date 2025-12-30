import { createTabsAtoms } from "@/core/state/tabs";
import type { TabDefinition } from "@/shared/components/ui/layout/TabContainer";

export interface TabType {
  commits: null;
  tree: {
    commit: Commit;
  };
  commitDiff: {
    commitFrom: Commit | "parent";
    commitTo: Commit;
  };
  file: {
    commit: Commit;
    path: string;
  };
}

export type RepositoryTab = TabDefinition<TabType>;

export const {
  tabsAtom: repoTabsAtom,
  resetTabsAtom: resetRepoTabsAtom,
  addTabAtom: addRepoTabAtom,
  removeTabAtom: removeRepoTabAtom,
  selectTabAtom: selectRepoTabAtom,
  selectNextTabAtom: selectNextRepoTabAtom,
  selectPreviousTabAtom: selectPreviousRepoTabAtom
} = createTabsAtoms<TabType>({
  tabs: [{ type: "commits", title: "HISTORY", id: "__COMMITS__", closable: false }],
  currentIndex: 0
});
