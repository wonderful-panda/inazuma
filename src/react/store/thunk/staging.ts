import { dispatchBrowser } from "@/dispatchBrowser";
import { serializeError } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ERROR } from "../misc";
import { RELOAD_WORKING_TREE } from "./reloadWorkingTree";

const stage = (relPath: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const repoPath = state.repository.path;
      if (!repoPath) {
        return;
      }
      await dispatchBrowser("addToIndex", { repoPath, relPath });
      await dispatch(RELOAD_WORKING_TREE());
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

const unstage = (relPath: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const repoPath = state.repository.path;
      if (!repoPath) {
        return;
      }
      await dispatchBrowser("removeFromIndex", { repoPath, relPath });
      await dispatch(RELOAD_WORKING_TREE());
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

export const STAGE = stage;
export const UNSTAGE = unstage;
