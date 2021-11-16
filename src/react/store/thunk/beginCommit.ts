import { serializeError } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ERROR } from "../misc";
import { OPEN_DIALOG } from "../repository";

const beginCommit = () => {
  return async (dispatch: Dispatch, getState: () => RootState): Promise<void> => {
    try {
      const state = getState();
      const repoPath = state.repository.path;
      if (!repoPath) {
        return;
      }
      dispatch(OPEN_DIALOG({ dialog: "commit" }));
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

export const BEGIN_COMMIT = beginCommit;
