import { Dispatch, RootState } from "..";
import { DialogProps, _CLEAR_DIALOG, _CLOSE_DIALOG, _OPEN_DIALOG } from "../repository";

const openDialog = (props: DialogProps) => {
  return async (dispatch: Dispatch) => {
    dispatch(_OPEN_DIALOG(props));
  };
};

const closeDialog = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const version = getState().repository.dialogVersion;
    dispatch(_CLOSE_DIALOG());
    setTimeout(() => {
      // keep dialogProps until transition end
      dispatch(_CLEAR_DIALOG(version));
    }, 500);
  };
};

export const OPEN_DIALOG = openDialog;
export const CLOSE_DIALOG = closeDialog;
