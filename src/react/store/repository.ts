import browserApi from "@/browserApi";
import { TabDefinition } from "@/components/TabContainer";
import { Grapher, GraphFragment } from "@/grapher";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

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

const openRepository = createAsyncThunk<{ path: string; log: State["log"] }, { path: string }>(
  "repository/open",
  async ({ path }) => {
    const { commits, refs } = await browserApi.openRepository(path);
    const grapher = new Grapher(["orange", "cyan", "yellow", "magenta"]);
    const graph: Record<string, GraphFragment> = {};
    commits.forEach((c) => {
      graph[c.id] = grapher.proceed(c);
    });
    return { path, log: { commits, refs, graph } };
  }
);

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

const removeTab = ({ tab }: State, { payload: index }: PayloadAction<number>) => {
  if (!tab) {
    return;
  }
  if (!tab.tabs[index].closable) {
    return;
  }
  tab.tabs.splice(index, 1);
  if (tab.tabs.length <= tab.currentIndex) {
    tab.currentIndex = tab.tabs.length - 1;
  } else if (index < tab.currentIndex) {
    tab.currentIndex -= 1;
  }
};

const selectTab = ({ tab }: State, { payload: index }: PayloadAction<number>) => {
  if (!tab) {
    return;
  }
  tab.currentIndex = index;
};

const slice = createSlice({
  name: "repository",
  initialState,
  reducers: {
    closeRepository,
    addTab,
    removeTab,
    selectTab
  },
  extraReducers: (builder) => {
    builder.addCase(openRepository.fulfilled, (state, action) => {
      state.path = action.payload.path;
      state.log = action.payload.log;
      state.tab = {
        tabs: [{ type: "commits", title: "COMMITS", id: "__COMMITS__", closable: false }],
        currentIndex: 0
      };
    });
  }
});

export const {
  closeRepository: CLOSE_REPOSITORY,
  addTab: ADD_TAB,
  removeTab: REMOVE_TAB,
  selectTab: SELECT_TAB
} = slice.actions;

export const OPEN_REPOSITORY = openRepository;

export default slice.reducer;
