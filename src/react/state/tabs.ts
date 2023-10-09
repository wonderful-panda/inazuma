import { TabDefinition } from "@/components/TabContainer";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { getRootStore } from "./rootStore";
import { createWacher } from "./util";

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

const {
  tabsAtom,
  addTabAtom,
  removeTabAtom,
  selectTabAtom,
  selectNextTabAtom,
  selectPreviousTabAtom
} = createTabsAtoms<AppTabType>({
  tabs: [{ type: "home", id: "__HOME__", title: "HOME", closable: false }],
  currentIndex: 0
});

const store = getRootStore();
const opt = { store };
export const useAppTabsValue = () => useAtomValue(tabsAtom, opt);
export const useAddAppTab = () => useSetAtom(addTabAtom, opt);
export const useRemoveAppTab = () => useSetAtom(removeTabAtom, opt);
export const useSelectAppTab = () => useSetAtom(selectTabAtom, opt);
export const useSelectNextAppTab = () => useSetAtom(selectNextTabAtom, opt);
export const useSelectPrevAppTab = () => useSetAtom(selectPreviousTabAtom, opt);

export const getAppTabsValue = () => store.get(tabsAtom);
export const addAppTab = (update: TabDefinition<AppTabType>) => store.set(addTabAtom, update);
export const removeAppTab = (index?: number) => store.set(removeTabAtom, index);
export const selectAppTab = (index: number) => store.set(selectTabAtom, index);
export const selectNextAppTab = () => store.set(selectNextTabAtom);
export const selectPrevAppTab = () => store.set(selectPreviousTabAtom);

const selectHomeTabAtom = atom(null, (_get, set) => {
  set(tabsAtom, (prev) => {
    const index = prev.tabs.findIndex((t) => t.type === "home");
    if (0 <= index) {
      return { tabs: prev.tabs, currentIndex: index };
    } else {
      return prev;
    }
  });
});
export const useSelectHomeTab = () => useSetAtom(selectHomeTabAtom, opt);
export const selectHomeTab = () => store.set(selectHomeTabAtom);

export const registerApplicationTabsWatcher = createWacher(tabsAtom, opt.store);

export const setInitialValue = (value: TabsState<AppTabType>) => {
  store.set(tabsAtom, value);
};
