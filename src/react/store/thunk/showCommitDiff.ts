import { serializeError, shortHash } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ERROR } from "../misc";
import { ADD_TAB } from "../repository";

const showCommitDiff = (commit1: DagNode, commit2: DagNode) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
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
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

export const SHOW_COMMIT_DIFF = showCommitDiff;
