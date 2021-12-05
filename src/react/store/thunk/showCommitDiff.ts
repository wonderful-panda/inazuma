import { shortHash } from "@/util";
import { Dispatch, RootState } from "..";
import { ADD_TAB } from "../repository";
import { withHandleError } from "./withHandleError";

const showCommitDiff = (commit1: Commit, commit2: Commit) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    dispatch(
      ADD_TAB({
        type: "commitDiff",
        id: `commitDiff:${commit1.id}-${commit2.id}`,
        title: `COMPARE @ ${shortHash(commit1.id)}-${shortHash(commit2.id)}`,
        payload: { commit1, commit2 },
        closable: true
      })
    );
  };
};

export const SHOW_COMMIT_DIFF = withHandleError(showCommitDiff);
