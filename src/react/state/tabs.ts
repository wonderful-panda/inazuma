import { TabDefinition } from "@/components/TabContainer";
import { atom } from "jotai";

export type TabsState<T> = { tabs: TabDefinition<T>[]; currentIndex: number };

export const createTabsAtoms = <T>(initialTabs: TabsState<T>) => {
  const tabsAtom = atom<TabsState<T>>(initialTabs);
  const resetTabsAtom = atom(null, (_get, set) => {
    set(tabsAtom, initialTabs);
  });

  const addTabAtom = atom(null, (_get, set, update: TabDefinition<T>) => {
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

  const removeTabAtom = atom(null, (_get, set, index?: number) => {
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
  const selectTabAtom = atom(null, (_get, set, index: number) => {
    set(tabsAtom, (prev) => {
      if (!prev) {
        return prev;
      } else {
        return { tabs: prev.tabs, currentIndex: index };
      }
    });
  });

  const selectNextTabAtom = atom(null, (_get, set) => {
    set(tabsAtom, (prev) => {
      if (!prev || prev.tabs.length === 0) {
        return prev;
      } else {
        const { tabs, currentIndex } = prev;
        return { tabs, currentIndex: (currentIndex + 1) % tabs.length };
      }
    });
  });

  const selectPreviousTabAtom = atom(null, (_get, set) => {
    set(tabsAtom, (prev) => {
      if (!prev || prev.tabs.length === 0) {
        return prev;
      } else {
        const { tabs, currentIndex } = prev;
        return { tabs, currentIndex: (currentIndex - 1 + tabs.length) % tabs.length };
      }
    });
  });

  return {
    tabsAtom,
    resetTabsAtom,
    addTabAtom,
    removeTabAtom,
    selectTabAtom,
    selectNextTabAtom,
    selectPreviousTabAtom
  };
};

export type AppTabType = {
  home: null;
  repository: { path: string };
};

export const {
  tabsAtom: appTabsAtom,
  resetTabsAtom: resetAppTabsAtom,
  addTabAtom: addAppTabAtom,
  removeTabAtom: removeAppTabAtom,
  selectTabAtom: selectAppTabAtom,
  selectNextTabAtom: selectNextAppTabAtom,
  selectPreviousTabAtom: selectPreviousAppTabAtom
} = createTabsAtoms<AppTabType>({
  tabs: [{ type: "home", id: "__HOME__", title: "HOME", closable: false }],
  currentIndex: 0
});
