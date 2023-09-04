import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Dispatch, RootState } from "..";
import { RELOAD_REPOSITORY } from "./repository";
import { withHandleError } from "./withHandleError";
import { withLoading } from "./withLoading";

import { HIDE_LOADING, SHOW_LOADING, SHOW_WARNING } from "../misc";
import { OPEN_DIALOG } from "./dialog";

const beginCreateBranch = (commitId: string) => {
  return async (dispatch: Dispatch, getState: () => RootState): Promise<void> => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    await dispatch(OPEN_DIALOG({ type: "NewBranch", commitId }));
  };
};

const createBranch = (options: CreateBranchOptions) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return false;
    }
    if (!options.branchName) {
      dispatch(SHOW_WARNING("Branch name is not specified"));
      return false;
    }
    await invokeTauriCommand("create_branch", { repoPath, options });
    await dispatch(RELOAD_REPOSITORY());
    return true;
  };
};

const deleteBranch = (options: DeleteBranchOptions) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return false;
    }
    await invokeTauriCommand("delete_branch", { repoPath, options });
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
    if (!options.branchName) {
      dispatch(SHOW_WARNING("Branch name is not specified"));
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

const switchBranchWithConfirm = (
  options: SwitchOptions,
  showConfirmDialog: (payload: { title: string; content: string }) => Promise<boolean>
) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return false;
    }
    const ret = await showConfirmDialog({
      title: "Switch branch",
      content: `Switch to branch [${options.branchName}]`
    });
    if (!ret) {
      return;
    }
    dispatch(SWITCH_BRANCH(options));
  };
};

export const BEGIN_CREATE_BRANCH = withHandleError(beginCreateBranch);
export const CREATE_BRANCH = withLoading(withHandleError(createBranch));
export const DELETE_BRANCH = withLoading(withHandleError(deleteBranch));
export const SWITCH_BRANCH = withLoading(withHandleError(switchBranch));
export const SWITCH_BRANCH_WITH_CONFIRM = withHandleError(switchBranchWithConfirm);
