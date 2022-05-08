import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Dispatch, RootState } from "..";
import { _SET_COMMIT_DETAIL } from "../repository";
import { withHandleError } from "./withHandleError";

const fetchCommitDetail = (revspec: string) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    const value = await invokeTauriCommand("get_commit_detail", { repoPath, revspec });
    dispatch(_SET_COMMIT_DETAIL({ repoPath, value }));
  };
};

export const FETCH_COMMIT_DETAIL = withHandleError(fetchCommitDetail);
