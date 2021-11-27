import { dispatchBrowser } from "@/dispatchBrowser";
import { serializeError } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ERROR } from "../misc";
import { _SET_COMMIT_DETAIL } from "../repository";

const fetchCommitDetail = (sha: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const repoPath = state.repository.path;
      if (!repoPath) {
        return;
      }
      const value = await dispatchBrowser("getCommitDetail", { repoPath, sha });
      dispatch(_SET_COMMIT_DETAIL({ repoPath, value }));
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

export const FETCH_COMMIT_DETAIL = fetchCommitDetail;
