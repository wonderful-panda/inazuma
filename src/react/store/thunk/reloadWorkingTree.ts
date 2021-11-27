import { dispatchBrowser } from "@/dispatchBrowser";
import { serializeError } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ERROR } from "../misc";
import { _SET_WORKING_TREE } from "../repository";

const reloadWorkingTree = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const repoPath = state.repository.path;
      if (!repoPath) {
        return;
      }
      const value = await dispatchBrowser("getWorkingTree", { repoPath });
      dispatch(_SET_WORKING_TREE({ repoPath, value }));
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

export const RELOAD_WORKING_TREE = reloadWorkingTree;
