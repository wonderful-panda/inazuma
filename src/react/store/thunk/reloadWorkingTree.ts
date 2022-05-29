import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Dispatch, RootState } from "..";
import { _SET_WORKING_TREE } from "../repository";
import { withHandleError } from "./withHandleError";

const reloadWorkingTree = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    const stat = await invokeTauriCommand("get_workingtree_stat", {
      repoPath
    });
    const value: WorkingTreeStat = {
      id: "--",
      author: "--",
      summary: "<Working tree>",
      date: BigInt(new Date().getTime()),
      ...stat
    };
    dispatch(_SET_WORKING_TREE({ repoPath, value }));
  };
};

export const RELOAD_WORKING_TREE = withHandleError(reloadWorkingTree);
