import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface State {
  config: Config;
  env: {
    recentOpenedRepositories: string[];
  };
}

const initialState: State = {
  config: {
    fontFamily: {},
    fontSize: "medium",
    recentListCount: 10
  },
  env: {
    recentOpenedRepositories: []
  }
};

const slice = createSlice({
  name: "persist",
  initialState,
  reducers: {
    updateConfig: (state, { payload: config }: PayloadAction<Config>) => {
      state.config = config;
    },
    addRecentOpendRepository: (state, { payload }: PayloadAction<string>) => {
      const newValue = [
        payload,
        ...state.env.recentOpenedRepositories.filter((p) => p !== payload)
      ];
      if (state.config.recentListCount < newValue.length) {
        newValue.length = state.config.recentListCount;
      }
      state.env.recentOpenedRepositories = newValue;
    },
    removeRecentOpenedRepository: (state, { payload }: PayloadAction<string>) => {
      state.env.recentOpenedRepositories = state.env.recentOpenedRepositories.filter(
        (p) => p !== payload
      );
    },
    resetRecentOpenedRepositories: (state, { payload }: PayloadAction<string[]>) => {
      if (state.config.recentListCount < payload.length) {
        payload.length = state.config.recentListCount;
      }
      state.env.recentOpenedRepositories = payload;
    }
  }
});

export const {
  updateConfig: UPDATE_CONFIG,
  addRecentOpendRepository: ADD_RECENT_OPENED_REPOSITORY,
  removeRecentOpenedRepository: REMOVE_RECENT_OPENED_REPOSITORY,
  resetRecentOpenedRepositories: RESET_RECENT_OPENED_REPOSITORIES
} = slice.actions;

export default slice.reducer;
