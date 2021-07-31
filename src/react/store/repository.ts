import { TabDefinition } from "@/components/TabContainer";
import useBrowserProcess from "@/hooks/useBrowserProcess";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const MAX_RECENT_OPENED = 100;

export type TabType = {
  commits: {};
  tree: {
    sha: string;
  };
  file: {
    sha: string;
    path: string;
  };
};
export interface State {
  repoPath: string | undefined;
  recentOpened: string[];
  refs: Refs;
  commits: Commit[];
  tabs: TabDefinition<TabType>[];
  currentTabIndex: number;
}

export const openRepository = createAsyncThunk<
  { repoPath: string; commits: Commit[]; refs: Refs },
  { repoPath: string; errorReporter: (e: unknown) => void; setLoading?: (loading: boolean) => void }
>("repository/open", async ({ repoPath, errorReporter, setLoading }) => {
  try {
    setLoading?.(true);
    const browserProcess = useBrowserProcess();
    const ret = await browserProcess.openRepository(repoPath);
    return { ...ret, repoPath };
  } catch (e) {
    errorReporter(e);
    throw e;
  } finally {
    setLoading?.(false);
  }
});

const initialState: State = {
  repoPath: undefined,
  recentOpened: [],
  commits: [],
  refs: {
    heads: [],
    mergeHeads: [],
    refsById: {},
    remotes: {},
    tags: []
  },
  tabs: [],
  currentTabIndex: -1
};

const addTab = (state: State, action: PayloadAction<TabDefinition<TabType>>) => {
  state.tabs.push(action.payload);
  state.currentTabIndex = state.tabs.length - 1;
};

const removeTab = (state: State, action: PayloadAction<number>) => {
  state.tabs.splice(action.payload, 1);
  if (state.tabs.length <= state.currentTabIndex) {
    state.currentTabIndex = state.tabs.length - 1;
  } else if (action.payload < state.currentTabIndex) {
    state.currentTabIndex -= 1;
  }
};

const selectTab = (state: State, action: PayloadAction<number>) => {
  state.currentTabIndex = action.payload;
};

const setRecentOpenedEntries = (state: State, action: PayloadAction<string[]>) => {
  state.recentOpened = action.payload;
};

const removeRecentOpenedEntry = (state: State, action: PayloadAction<string>) => {
  state.recentOpened = state.recentOpened.filter((v) => v != action.payload);
};

const closeRepository = (state: State): State => ({
  ...initialState,
  recentOpened: state.recentOpened
});

const slice = createSlice({
  name: "Repository",
  initialState,
  reducers: {
    addTab,
    removeTab,
    selectTab,
    closeRepository,
    setRecentOpenedEntries,
    removeRecentOpenedEntry
  },
  extraReducers: (builder) => {
    builder.addCase(openRepository.fulfilled, (state, action) => {
      state.repoPath = action.payload.repoPath;
      state.commits = action.payload.commits;
      state.refs = action.payload.refs;
      state.tabs = [
        { type: "commits", title: "COMMITS", id: "__COMMITS__", closable: false, payload: {} }
      ];
      state.currentTabIndex = 0;
      state.recentOpened = [
        action.payload.repoPath,
        ...state.recentOpened.filter((v) => v != action.payload.repoPath)
      ];
      if (MAX_RECENT_OPENED <= state.recentOpened.length) {
        state.recentOpened.length = MAX_RECENT_OPENED;
      }
    });
  }
});

export const {
  addTab: ADD_TAB,
  removeTab: REMOVE_TAB,
  selectTab: SELECT_TAB,
  closeRepository: CLOSE_REPOSITORY,
  setRecentOpenedEntries: SET_RECENT_OPENED_ENTRIES,
  removeRecentOpenedEntry: REMOVE_RECENT_OPENED_ENTRIES
} = slice.actions;
export default slice.reducer;
