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
    const files: Record<WorkingTreeFileKind["type"], WorkingTreeFileEntry[]> = {
      unmerged: [],
      unstaged: [],
      staged: []
    };
    for (const file of stat.files) {
      files[file.kind.type].push(file);
    }
    const value: WorkingTreeStat = {
      id: "--",
      author: "--",
      summary: "<Working tree>",
      date: Date.now(),
      parentIds: stat.parentIds,
      unmergedFiles: files.unmerged,
      unstagedFiles: files.unstaged,
      stagedFiles: files.staged
    };
    dispatch(_SET_WORKING_TREE({ repoPath, value }));
  };
};

export const RELOAD_WORKING_TREE = withHandleError(reloadWorkingTree);
