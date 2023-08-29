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

export type DialogProps = { type: "Commit" } | { type: "NewBranch"; commitId: string };

interface State {
  path: string | undefined;
  log: CommitLogItems | undefined;
  workingTree: WorkingTreeStat | undefined;
  commitDetail: CommitDetail | undefined;
  tab:
    | {
        tabs: RepositoryTab[];
        currentIndex: number;
      }
    | undefined;
  activeDialog: DialogProps | undefined;
  dialogOpened: boolean;
  dialogVersion: number;
}

const initialState: State = {
  path: undefined,
  log: undefined,
  workingTree: undefined,
  commitDetail: undefined,
  tab: undefined,
  activeDialog: undefined,
  dialogOpened: false,
  dialogVersion: 0
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
  state.workingTree = undefined;
  state.commitDetail = undefined;
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
  state.workingTree = undefined;
  state.commitDetail = undefined;
  state.tab = undefined;
  state.activeDialog = undefined;
};

const setWorkingTree = (
  state: State,
  { payload }: PayloadAction<{ repoPath: string; value: WorkingTreeStat }>
) => {
  if (state.path === payload.repoPath) {
    state.workingTree = payload.value;
  }
};

const setCommitDetail = (
  state: State,
  { payload }: PayloadAction<{ repoPath: string; value: CommitDetail }>
) => {
  if (state.path === payload.repoPath) {
    state.commitDetail = payload.value;
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

const openDialog = (state: State, { payload }: PayloadAction<DialogProps>) => {
  state.activeDialog = payload;
  state.dialogOpened = true;
  state.dialogVersion += 1;
};

const closeDialog = (state: State) => {
  state.dialogOpened = false;
};

const clearDialog = (state: State, { payload }: PayloadAction<number>) => {
  if (state.dialogVersion === payload) {
    state.activeDialog = undefined;
    state.dialogOpened = false;
  }
};

const slice = createSlice({
  name: "repository",
  initialState,
  reducers: {
    setLog,
    setWorkingTree,
    setCommitDetail,
    closeRepository,
    addTab,
    removeTab,
    selectTab,
    selectNextTab,
    selectPreviousTab,
    openDialog,
    closeDialog,
    clearDialog
  }
});

export const {
  setLog: _SET_LOG,
  setWorkingTree: _SET_WORKING_TREE,
  setCommitDetail: _SET_COMMIT_DETAIL,
  closeRepository: _CLOSE_REPOSITORY,
  addTab: ADD_TAB,
  removeTab: REMOVE_TAB,
  selectTab: SELECT_TAB,
  selectNextTab: SELECT_NEXT_TAB,
  selectPreviousTab: SELECT_PREVIOUS_TAB,
  openDialog: _OPEN_DIALOG,
  closeDialog: _CLOSE_DIALOG,
  clearDialog: _CLEAR_DIALOG
} = slice.actions;

export default slice.reducer;
