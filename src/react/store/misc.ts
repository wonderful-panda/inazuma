import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface State {
  loading: boolean;
  showInteractiveShell: boolean;
  alert:
    | {
        type: AlertType;
        message: string;
      }
    | undefined;
}

const initialState: State = {
  loading: false,
  showInteractiveShell: false,
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
    showError: (state, { payload: { error } }: PayloadAction<{ error: ErrorLike | Error }>) => {
      state.alert = {
        type: "error",
        message: `[${error.name}] ${error.message}`
      };
    },
    hideAlert: (state) => {
      state.alert = undefined;
    },
    showInteractiveShell: (state) => {
      state.showInteractiveShell = true;
    },
    hideInteractiveShell: (state) => {
      state.showInteractiveShell = false;
    },
    toggleInteractiveShell: (state) => {
      state.showInteractiveShell = !state.showInteractiveShell;
    }
  }
});

export const {
  showLoading: SHOW_LOADING,
  hideLoading: HIDE_LOADING,
  showAlert: SHOW_ALERT,
  showError: SHOW_ERROR,
  hideAlert: HIDE_ALERT,
  showInteractiveShell: SHOW_INTERACTIVE_SHELL,
  hideInteractiveShell: HIDE_INTERACTIVE_SHELL,
  toggleInteractiveShell: TOGGLE_INTERACTIVE_SHELL
} = slice.actions;

export default slice.reducer;
