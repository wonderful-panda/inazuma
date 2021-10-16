import { TabDefinition } from "@/components/TabContainer";
import { GraphFragment } from "@/grapher";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TabType = {
  commits: null;
  tree: {
    sha: string;
  };
  file: {
    sha: string;
    path: string;
  };
};

export type RepositoryTab = TabDefinition<TabType>;

interface State {
  path: string | undefined;
  log:
    | {
        commits: Commit[];
        refs: Refs;
        graph: Record<string, GraphFragment>;
      }
    | undefined;
  tab:
    | {
        tabs: RepositoryTab[];
        currentIndex: number;
      }
    | undefined;
}

const initialState: State = {
  path: undefined,
  log: undefined,
  tab: undefined
};

const setLog = (
  state: State,
  {
    payload: { path, ...log }
  }: PayloadAction<{
    path: string;
    commits: Commit[];
    refs: Refs;
    graph: Record<string, GraphFragment>;
  }>
) => {
  state.path = path;
  state.log = log;
  state.tab = {
    tabs: [{ type: "commits", title: "COMMITS", id: "__COMMITS__", closable: false }],
    currentIndex: 0
  };
};

const closeRepository = (state: State) => {
  state.path = undefined;
  state.log = undefined;
  state.tab = undefined;
};

const addTab = ({ tab }: State, { payload }: PayloadAction<RepositoryTab>) => {
  if (!tab) {
    return;
  }
  const index = tab.tabs.findIndex((t) => t.id === payload.id);
  if (0 <= index) {
    tab.currentIndex = index;
    return;
  } else {
    tab.tabs.push(payload);
    tab.currentIndex = tab.tabs.length - 1;
  }
};

const removeTab = ({ tab }: State, { payload: index }: PayloadAction<number | undefined>) => {
  if (!tab) {
    return;
  }
  const realIndex = index === undefined ? tab.currentIndex : index;
  if (!tab.tabs[realIndex].closable) {
    return;
  }
  tab.tabs.splice(realIndex, 1);
  if (tab.tabs.length <= tab.currentIndex) {
    tab.currentIndex = tab.tabs.length - 1;
  } else if (realIndex < tab.currentIndex) {
    tab.currentIndex -= 1;
  }
};

const selectTab = ({ tab }: State, { payload: index }: PayloadAction<number>) => {
  if (!tab) {
    return;
  }
  tab.currentIndex = index;
};

const selectNextTab = ({ tab }: State) => {
  if (!tab || tab.tabs.length === 0) {
    return;
  }
  tab.currentIndex = tab.currentIndex < tab.tabs.length - 1 ? tab.currentIndex + 1 : 0;
};

const selectPreviousTab = ({ tab }: State) => {
  if (!tab || tab.tabs.length === 0) {
    return;
  }
  tab.currentIndex = 1 <= tab.currentIndex ? tab.currentIndex - 1 : tab.tabs.length - 1;
};

const slice = createSlice({
  name: "repository",
  initialState,
  reducers: {
    setLog,
    closeRepository,
    addTab,
    removeTab,
    selectTab,
    selectNextTab,
    selectPreviousTab
  }
});

export const {
  setLog: _SET_LOG,
  closeRepository: CLOSE_REPOSITORY,
  addTab: ADD_TAB,
  removeTab: REMOVE_TAB,
  selectTab: SELECT_TAB,
  selectNextTab: SELECT_NEXT_TAB,
  selectPreviousTab: SELECT_PREVIOUS_TAB
} = slice.actions;

export default slice.reducer;
