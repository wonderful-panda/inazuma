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
    const stat = await invokeTauriCommand("get_workingtree_stat2", {
      repoPath
    });
    const unmergedFiles: FileEntry[] = [];
    const unstagedFiles: FileEntry[] = [];
    const stagedFiles: FileEntry[] = [];
    for (const file of stat.files) {
      if (file.statusCode === "U") {
        unmergedFiles.push(file);
      } else if (file.unstaged) {
        unstagedFiles.push(file);
      } else {
        stagedFiles.push(file);
      }
    }
    const value: WorkingTreeStat = {
      id: "--",
      author: "--",
      summary: "<Working tree>",
      date: Date.now(),
      parentIds: stat.parentIds,
      unmergedFiles,
      unstagedFiles,
      stagedFiles
    };
    dispatch(_SET_WORKING_TREE({ repoPath, value }));
  };
};

export const RELOAD_WORKING_TREE = withHandleError(reloadWorkingTree);
