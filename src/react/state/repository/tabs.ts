import { TabDefinition } from "@/components/TabContainer";
import { createTabsAtoms } from "../tabs";

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

export const {
  tabsAtom: repoTabsAtom,
  resetTabsAtom: resetRepoTabsAtom,
  addTabAtom: addRepoTabAtom,
  removeTabAtom: removeRepoTabAtom,
  selectTabAtom: selectRepoTabAtom,
  selectNextTabAtom: selectNextRepoTabAtom,
  selectPreviousTabAtom: selectPreviousRepoTabAtom
} = createTabsAtoms<TabType>({
  tabs: [{ type: "commits", title: "COMMITS", id: "__COMMITS__", closable: false }],
  currentIndex: 0
});
