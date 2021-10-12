import { createSlice } from "@reduxjs/toolkit";
interface State {
  loading: boolean;
}

const initialState: State = {
  loading: false
};

const slice = createSlice({
  name: "misc",
  initialState,
  reducers: {
    showLoading: (state) => {
      state.loading = true;
    },
    hideLoading: (state) => {
      state.loading = false;
    }
  }
});

export const { showLoading: SHOW_LOADING, hideLoading: HIDE_LOADING } = slice.actions;

export default slice.reducer;
