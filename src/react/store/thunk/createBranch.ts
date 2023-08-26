import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Dispatch, RootState } from "..";
import { RELOAD_REPOSITORY } from "./repository";
import { withHandleError } from "./withHandleError";
import { withLoading } from "./withLoading";

import { OPEN_DIALOG } from "../repository";

const beginCreateBranch = (commitId: string) => {
  return async (dispatch: Dispatch, getState: () => RootState): Promise<void> => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    dispatch(OPEN_DIALOG({ type: "NewBranch", commitId }));
  };
};

const createBranch = (options: CreateBranchOptions) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return false;
    }
    await invokeTauriCommand("create_branch", { repoPath, options });
    await dispatch(RELOAD_REPOSITORY());
    return true;
  };
};

export const BEGIN_CREATE_BRANCH = withHandleError(beginCreateBranch);
export const CREATE_BRANCH = withLoading(withHandleError(createBranch));
