import { TabDefinition } from "@/components/TabContainer";
import { atom } from "jotai";

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

const initialTabs: TabsState = { tabs: [], currentIndex: -1 };
export const tabsAtom = atom<TabsState>(initialTabs);

export const resetTabsAtom = atom(null, (_get, set) => {
  set(tabsAtom, initialTabs);
});

export const addTabAtom = atom(null, (_get, set, update: RepositoryTab) => {
  set(tabsAtom, (prev) => {
    if (!prev) {
      return prev;
    }
    const index = prev.tabs.findIndex((t) => t.id === update.id);
    if (0 <= index) {
      return { tabs: prev.tabs, currentIndex: index };
    } else {
      return { tabs: [...prev.tabs, update], currentIndex: prev.tabs.length };
    }
  });
});

export const removeTabAtom = atom(null, (_get, set, index?: number) => {
  set(tabsAtom, (prev) => {
    if (!prev) {
      return prev;
    }
    const realIndex = index === undefined ? prev.currentIndex : index;
    if (!prev.tabs[realIndex].closable) {
      return prev;
    }
    const tabs = prev.tabs.filter((_, i) => i !== realIndex);
    let currentIndex;
    if (tabs.length <= prev.currentIndex) {
      currentIndex = tabs.length - 1;
    } else if (realIndex < prev.currentIndex) {
      currentIndex = prev.currentIndex - 1;
    } else {
      currentIndex = prev.currentIndex;
    }
    return { tabs, currentIndex };
  });
});

export const selectTabAtom = atom(null, (_get, set, index: number) => {
  set(tabsAtom, (prev) => {
    if (!prev) {
      return prev;
    } else {
      return { tabs: prev.tabs, currentIndex: index };
    }
  });
});

export const selectNextTabAtom = atom(null, (_get, set) => {
  set(tabsAtom, (prev) => {
    if (!prev || prev.tabs.length === 0) {
      return prev;
    } else {
      const { tabs, currentIndex } = prev;
      return { tabs, currentIndex: (currentIndex + 1) % tabs.length };
    }
  });
});

export const selectPreviousTabAtom = atom(null, (_get, set) => {
  set(tabsAtom, (prev) => {
    if (!prev || prev.tabs.length === 0) {
      return prev;
    } else {
      const { tabs, currentIndex } = prev;
      return { tabs, currentIndex: (currentIndex - 1 + tabs.length) % tabs.length };
    }
  });
});
