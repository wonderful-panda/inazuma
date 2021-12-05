import { Dispatch, RootState } from "..";
import { OPEN_DIALOG } from "../repository";
import { withHandleError } from "./withHandleError";

const beginCommit = () => {
  return async (dispatch: Dispatch, getState: () => RootState): Promise<void> => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    dispatch(OPEN_DIALOG({ dialog: "commit" }));
  };
};

export const BEGIN_COMMIT = withHandleError(beginCommit);
