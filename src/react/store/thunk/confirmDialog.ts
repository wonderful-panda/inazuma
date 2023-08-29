import { Dispatch, watch } from "..";
import { _CLOSE_CONFIRM_DIALOG, _SET_CONFIRM_DIALOG } from "../confirmDialog";

let currentVersion = 0;
const showConfirmDialog = ({ title, content }: { title?: string; content: string }) => {
  return async (dispatch: Dispatch) => {
    const version = (currentVersion & 0xff) + 1;
    currentVersion = version;
    return new Promise<boolean>((resolve) => {
      dispatch(
        _SET_CONFIRM_DIALOG({
          version,
          title,
          content,
          status: "open"
        })
      );
      const unwatch = watch(
        (state) => state.confirmDialog,
        (value) => {
          if (value.version !== version) {
            unwatch();
            resolve(false);
          } else if (value.status !== "open") {
            unwatch();
            resolve(value.status === "accepted");
          }
        }
      );
    });
  };
};

const closeConfirmDialog = (payload: { accepted: boolean }) => {
  return async (dispatch: Dispatch) => {
    dispatch(_CLOSE_CONFIRM_DIALOG(payload));
  };
};

export const SHOW_CONFIRM_DIALOG = showConfirmDialog;
export const CLOSE_CONFIRM_DIALOG = closeConfirmDialog;
