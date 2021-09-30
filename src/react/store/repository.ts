import { TabDefinition } from "@/components/TabContainer";
import { Grapher, GraphFragment } from "@/grapher";
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
  graph: Record<string, GraphFragment>;
  tabs: TabDefinition<TabType>[];
  currentTabIndex: number;
  selectedLogIndex: number;
  selectedLogEntry: LogDetail | undefined;
}

export const openRepository = createAsyncThunk<
  { repoPath: string; commits: Commit[]; refs: Refs; graph: Record<string, GraphFragment> },
  { repoPath: string; errorReporter: (e: unknown) => void; setLoading?: (loading: boolean) => void }
>("repository/open", async ({ repoPath, errorReporter, setLoading }) => {
  try {
    setLoading?.(true);
    const browserProcess = useBrowserProcess();
    const ret = await browserProcess.openRepository(repoPath);
    const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
    const graph: Record<string, GraphFragment> = {};
    ret.commits.forEach((c) => {
      graph[c.id] = grapher.proceed(c);
    });
    return { ...ret, graph, repoPath };
  } catch (e) {
    errorReporter(e);
    throw e;
  } finally {
    setLoading?.(false);
  }
});

export const selectLogEntry = createAsyncThunk<
  { entry?: LogDetail },
  { index: number; errorReporter: (e: unknown) => void; setLoading?: (loading: boolean) => void }
>("repository/selectCommit", async ({ index, errorReporter, setLoading }, { getState }) => {
  try {
    setLoading?.(true);
    const state = (getState() as any).repository as State;
    if (!state.repoPath) {
      throw new Error("Repository is not opened");
    }
    if (index < 0) {
      return { entry: undefined };
    }
    const browserProcess = useBrowserProcess();
    const entry = await browserProcess.getLogDetail({
      repoPath: state.repoPath,
      sha: state.commits[index].id
    });
    return { entry };
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
  graph: {},
  refs: {
    heads: [],
    mergeHeads: [],
    refsById: {},
    remotes: {},
    tags: []
  },
  tabs: [],
  currentTabIndex: -1,
  selectedLogIndex: -1,
  selectedLogEntry: undefined
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
      state.graph = action.payload.graph;
      state.refs = action.payload.refs;
      state.tabs = [
        { type: "commits", title: "COMMITS", id: "__COMMITS__", closable: false, payload: {} }
      ];
      state.currentTabIndex = 0;
      state.selectedLogIndex = -1;
      state.selectedLogEntry = undefined;
      state.recentOpened = [
        action.payload.repoPath,
        ...state.recentOpened.filter((v) => v != action.payload.repoPath)
      ];
      if (MAX_RECENT_OPENED <= state.recentOpened.length) {
        state.recentOpened.length = MAX_RECENT_OPENED;
      }
    });
    builder.addCase(selectLogEntry.pending, (state, action) => {
      state.selectedLogIndex = action.meta.arg.index;
    });
    builder.addCase(selectLogEntry.fulfilled, (state, action) => {
      state.selectedLogEntry = action.payload.entry;
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
