import { TabDefinition } from "@/components/TabContainer";
import { GraphFragment } from "@/grapher";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
export interface CommitLogItems {
  commits: Commit[];
  refs: Refs;
  graph: Record<string, GraphFragment>;
}

interface State {
  path: string | undefined;
  log: CommitLogItems | undefined;
  selectedLogDetail: LogDetail | undefined;
  tab:
    | {
        tabs: RepositoryTab[];
        currentIndex: number;
      }
    | undefined;
  activeDialog: "commit" | undefined;
}

const initialState: State = {
  path: undefined,
  log: undefined,
  selectedLogDetail: undefined,
  tab: undefined,
  activeDialog: undefined
};

const setLog = (
  state: State,
  {
    payload: { path, keepTabs, ...log }
  }: PayloadAction<{
    path: string;
    keepTabs: boolean;
    commits: Commit[];
    refs: Refs;
    graph: Record<string, GraphFragment>;
  }>
) => {
  state.path = path;
  state.log = log;
  state.selectedLogDetail = undefined;
  state.activeDialog = undefined;
  if (!keepTabs) {
    state.tab = {
      tabs: [{ type: "commits", title: "COMMITS", id: "__COMMITS__", closable: false }],
      currentIndex: 0
    };
  }
};

const closeRepository = (state: State) => {
  state.path = undefined;
  state.log = undefined;
  state.selectedLogDetail = undefined;
  state.tab = undefined;
  state.activeDialog = undefined;
};

const setSelectedLogDetail = (
  state: State,
  { payload }: PayloadAction<{ repoPath: string; value: LogDetail | undefined }>
) => {
  if (state.path === payload.repoPath) {
    state.selectedLogDetail = payload.value;
  }
};

const addTab = ({ tab }: State, { payload }: PayloadAction<RepositoryTab>) => {
  if (!tab) {
    return;
  }
  const index = tab.tabs.findIndex((t) => t.id === payload.id);
  if (0 <= index) {
    tab.currentIndex = index;
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

const openDialog = (state: State, { payload }: PayloadAction<{ dialog: "commit" }>) => {
  state.activeDialog = payload.dialog;
};

const closeDialog = (state: State) => {
  state.activeDialog = undefined;
};

const slice = createSlice({
  name: "repository",
  initialState,
  reducers: {
    setLog,
    setSelectedLogDetail,
    closeRepository,
    addTab,
    removeTab,
    selectTab,
    selectNextTab,
    selectPreviousTab,
    openDialog,
    closeDialog
  }
});

export const {
  setLog: _SET_LOG,
  setSelectedLogDetail: _SET_SELECTED_LOG_DETAIL,
  closeRepository: CLOSE_REPOSITORY,
  addTab: ADD_TAB,
  removeTab: REMOVE_TAB,
  selectTab: SELECT_TAB,
  selectNextTab: SELECT_NEXT_TAB,
  selectPreviousTab: SELECT_PREVIOUS_TAB,
  openDialog: OPEN_DIALOG,
  closeDialog: CLOSE_DIALOG
} = slice.actions;

export default slice.reducer;
