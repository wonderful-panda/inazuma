import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface State {
  loading: boolean;
  alert:
    | {
        type: AlertType;
        message: string;
      }
    | undefined;
}

const initialState: State = {
  loading: false,
  alert: undefined
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
    },
    showAlert: (state, { payload }: PayloadAction<{ type: AlertType; message: string }>) => {
      state.alert = payload;
    },
    showError: (state, { payload: { error } }: PayloadAction<{ error: unknown }>) => {
      state.alert = {
        type: "error",
        message: error instanceof Error ? `[${error.name}] ${error.message}` : `${error}`
      };
    },
    hideAlert: (state) => {
      state.alert = undefined;
    }
  }
});

export const {
  showLoading: SHOW_LOADING,
  hideLoading: HIDE_LOADING,
  showAlert: SHOW_ALERT,
  showError: SHOW_ERROR,
  hideAlert: HIDE_ALERT
} = slice.actions;

export default slice.reducer;
