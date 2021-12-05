import { dispatchBrowser } from "@/dispatchBrowser";
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
    await dispatchBrowser("addToIndex", { repoPath, relPath });
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
    await dispatchBrowser("removeFromIndex", { repoPath, relPath });
    await dispatch(RELOAD_WORKING_TREE());
  };
};

export const STAGE = withHandleError(stage);
export const UNSTAGE = withHandleError(unstage);
