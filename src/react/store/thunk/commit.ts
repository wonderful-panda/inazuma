import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Dispatch, RootState } from "..";
import { SHOW_WARNING } from "../misc";
import { RELOAD_REPOSITORY } from "./openRepository";
import { withHandleError } from "./withHandleError";

const commit = (options: CommitOptions) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    if (options.commitType === "normal" && !options.message) {
      dispatch(SHOW_WARNING("Input commit message"));
      return false;
    }
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return false;
    }
    const stat = await invokeTauriCommand("get_workingtree_stat", { repoPath });
    if (options.commitType === "normal" && stat.stagedFiles.length === 0) {
      dispatch(SHOW_WARNING("Nothing to commit"));
      return false;
    }
    if (stat.stagedFiles.find((f) => f.statusCode === "U")) {
      dispatch(SHOW_WARNING("One or more files are still unmerged"));
      return false;
    }
    await invokeTauriCommand("commit", { repoPath, options });
    await dispatch(RELOAD_REPOSITORY());
    return true;
  };
};

export const COMMIT = withHandleError(commit);
