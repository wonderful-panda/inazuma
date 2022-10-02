import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Dispatch, RootState } from "..";
import { SHOW_CONFIRM_DIALOG } from "./confirmDialog";
import { RELOAD_WORKING_TREE } from "./reloadWorkingTree";
import { withHandleError } from "./withHandleError";

const stage = (relPath: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    await invokeTauriCommand("stage", { repoPath, relPath });
    await dispatch(RELOAD_WORKING_TREE());
  };
};

const unstage = (relPath: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    await invokeTauriCommand("unstage", { repoPath, relPath });
    await dispatch(RELOAD_WORKING_TREE());
  };
};

const restore = (relPath: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    const ret = await dispatch(
      SHOW_CONFIRM_DIALOG({
        title: "Restore",
        content: "Discard unstaged changes of selected file"
      })
    );
    if (!ret) {
      return;
    }
    await invokeTauriCommand("restore", { repoPath, relPath });
    await dispatch(RELOAD_WORKING_TREE());
  };
};

export const STAGE = withHandleError(stage);
export const UNSTAGE = withHandleError(unstage);
export const RESTORE = withHandleError(restore);
