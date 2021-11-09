import browserApi from "@/browserApi";
import { serializeError } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ERROR } from "../misc";
import { _SET_SELECTED_LOG_DETAIL } from "../repository";

const stage = (relPath: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const repoPath = state.repository.path;
      if (!repoPath) {
        return;
      }
      await browserApi.addToIndex({ repoPath, relPath });
      if (state.repository.selectedLogDetail?.id === "--") {
        const value = await browserApi.getLogDetail({ repoPath, sha: "--" });
        dispatch(_SET_SELECTED_LOG_DETAIL({ repoPath, value }));
      }
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
      await browserApi.removeFromIndex({ repoPath, relPath });
      if (state.repository.selectedLogDetail?.id === "--") {
        const value = await browserApi.getLogDetail({ repoPath, sha: "--" });
        dispatch(_SET_SELECTED_LOG_DETAIL({ repoPath, value }));
      }
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

export const STAGE = stage;
export const UNSTAGE = unstage;