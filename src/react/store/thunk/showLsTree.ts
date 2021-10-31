import { serializeError, shortHash } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ERROR } from "../misc";
import { ADD_TAB } from "../repository";

const showLsTree = (commit: DagNode) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
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
          payload: { sha: commit.id },
          closable: true
        })
      );
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

export default showLsTree;
