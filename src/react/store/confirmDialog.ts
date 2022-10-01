import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface State {
  version: number;
  title?: string;
  content: string;
  status: "open" | "accepted" | "canceled";
}

const initialState: State = {
  version: 0,
  content: "",
  status: "canceled"
};

const slice = createSlice({
  name: "confirmDialog",
  initialState,
  reducers: {
    _setConfirmDialog: (state, { payload }: PayloadAction<State>) => {
      Object.assign(state, payload);
    },
    _closeConfirmDialog: (
      state,
      { payload: { accepted } }: PayloadAction<{ accepted: boolean }>
    ) => {
      state.status = accepted ? "accepted" : "canceled";
    }
  }
});

export const {
  _setConfirmDialog: _SET_CONFIRM_DIALOG,
  _closeConfirmDialog: _CLOSE_CONFIRM_DIALOG
} = slice.actions;

export default slice.reducer;
