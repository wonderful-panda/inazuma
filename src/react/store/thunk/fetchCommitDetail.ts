import { dispatchBrowser } from "@/dispatchBrowser";
import { Dispatch, RootState } from "..";
import { _SET_COMMIT_DETAIL } from "../repository";
import { withHandleError } from "./withHandleError";

const fetchCommitDetail = (sha: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    const value = await dispatchBrowser("getCommitDetail", { repoPath, sha });
    dispatch(_SET_COMMIT_DETAIL({ repoPath, value }));
  };
};

export const FETCH_COMMIT_DETAIL = withHandleError(fetchCommitDetail);
