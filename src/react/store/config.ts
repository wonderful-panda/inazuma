import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Config = {
  fontFamily: {},
  recentListCount: 10
};

const slice = createSlice({
  name: "Config",
  initialState,
  reducers: {
    updateConfig: (_, action: PayloadAction<Config>) => action.payload
  }
});

export const { updateConfig: UPDATE_CONFIG } = slice.actions;
export default slice.reducer;
