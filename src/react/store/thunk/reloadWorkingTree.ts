import { dispatchBrowser } from "@/dispatchBrowser";
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
    const value = await dispatchBrowser("getWorkingTree", { repoPath });
    dispatch(_SET_WORKING_TREE({ repoPath, value }));
  };
};

export const RELOAD_WORKING_TREE = withHandleError(reloadWorkingTree);
