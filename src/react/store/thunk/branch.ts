import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Dispatch, RootState } from "..";
import { RELOAD_REPOSITORY } from "./repository";
import { withHandleError } from "./withHandleError";
import { withLoading } from "./withLoading";

import { OPEN_DIALOG } from "../repository";
import { SHOW_CONFIRM_DIALOG } from "./confirmDialog";
import { HIDE_LOADING, SHOW_LOADING } from "../misc";

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

const switchBranch = (options: SwitchOptions) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return false;
    }
    try {
      dispatch(SHOW_LOADING());
      await invokeTauriCommand("switch", { repoPath, options });
      await dispatch(RELOAD_REPOSITORY());
    } finally {
      dispatch(HIDE_LOADING());
    }
    return true;
  };
};

const switchBranchWithConfirm = (options: SwitchOptions) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return false;
    }
    const ret = await dispatch(
      SHOW_CONFIRM_DIALOG({
        title: "Switch branch",
        content: `Switch to branch [${options.branchName}]`
      })
    );
    if (!ret) {
      return;
    }
    dispatch(SWITCH_BRANCH(options));
  };
};

export const BEGIN_CREATE_BRANCH = withHandleError(beginCreateBranch);
export const CREATE_BRANCH = withLoading(withHandleError(createBranch));
export const SWITCH_BRANCH = withLoading(withHandleError(switchBranch));
export const SWITCH_BRANCH_WITH_CONFIRM = withHandleError(switchBranchWithConfirm);
