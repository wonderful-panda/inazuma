import { dispatchBrowser } from "@/dispatchBrowser";
import { serializeError } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ERROR } from "../misc";
import { _SET_SELECTED_LOG_DETAIL } from "../repository";

const showLogDetail = (sha: string | undefined) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const repoPath = state.repository.path;
      if (!repoPath) {
        return;
      }
      if (!sha) {
        dispatch(_SET_SELECTED_LOG_DETAIL({ repoPath, value: undefined }));
      } else {
        const value = await dispatchBrowser("getLogDetail", { repoPath, sha });
        dispatch(_SET_SELECTED_LOG_DETAIL({ repoPath, value }));
      }
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

export const SHOW_LOG_DETAIL = showLogDetail;
