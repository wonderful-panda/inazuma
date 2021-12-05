import { dispatchBrowser } from "@/dispatchBrowser";
import { Dispatch, RootState } from "..";
import { SHOW_WARNING } from "../misc";
import { RELOAD_REPOSITORY } from "./reloadRepository";
import { withHandleError } from "./withHandleError";

const commit = (options: CommitOptions) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    if (!options.amend && !options.message) {
      dispatch(SHOW_WARNING("Input commit message"));
      return false;
    }
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return false;
    }
    const stat = await dispatchBrowser("getLogDetail", { repoPath, sha: "--" });
    if (stat.type !== "status") {
      throw new Error("stat.type must be 'status'");
    }
    if (!options.amend && stat.stagedFiles.length === 0) {
      dispatch(SHOW_WARNING("Nothing to commit"));
      return false;
    }
    if (stat.stagedFiles.find((f) => f.statusCode === "U")) {
      dispatch(SHOW_WARNING("One or more files are still unmerged"));
      return false;
    }
    await dispatchBrowser("commit", { repoPath, options });
    await dispatch(RELOAD_REPOSITORY());
    return true;
  };
};

export const COMMIT = withHandleError(commit);
