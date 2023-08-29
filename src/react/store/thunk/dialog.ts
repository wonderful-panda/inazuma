import { Dispatch, RootState, watch } from "..";
import { DialogParam, _CLEAR_DIALOG, _CLOSE_DIALOG, _OPEN_DIALOG } from "../repository";

const openDialog = (param: DialogParam) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    return new Promise<void>((resolve) => {
      dispatch(_OPEN_DIALOG(param));
      const version = getState().repository.activeDialog?.version;
      const unwatch = watch(
        (state) => state.repository.activeDialog,
        (value) => {
          if (!value || !value.opened || version !== value.version) {
            unwatch();
            resolve();
          }
        }
      );
    });
  };
};

const closeDialog = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const version = getState().repository.activeDialog?.version;
    if (!version) {
      return;
    }
    dispatch(_CLOSE_DIALOG());
    setTimeout(() => {
      // keep dialogProps until transition end
      dispatch(_CLEAR_DIALOG(version));
    }, 500);
  };
};

export const OPEN_DIALOG = openDialog;
export const CLOSE_DIALOG = closeDialog;
