import { shortHash } from "@/util";
import { Dispatch, RootState } from "..";
import { ADD_TAB } from "../repository";
import { withHandleError } from "./withHandleError";

const showLsTree = (commit: Commit) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    dispatch(
      ADD_TAB({
        type: "tree",
        id: `tree:${commit.id}`,
        title: `TREE @ ${shortHash(commit.id)}`,
        payload: { commit },
        closable: true
      })
    );
  };
};

export const SHOW_LSTREE = withHandleError(showLsTree);
