import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Dispatch, RootState } from "..";
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

const restore = (
  relPath: string,
  showConfirmDialog: (payload: { title: string; content: string }) => Promise<boolean>
) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    const ret = await showConfirmDialog({
      title: "Restore",
      content: "Discard unstaged changes of selected file"
    });
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
