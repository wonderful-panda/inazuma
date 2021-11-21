import { dispatchBrowser } from "@/dispatchBrowser";
import { serializeError } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ALERT, SHOW_ERROR } from "../misc";
import { RELOAD_REPOSITORY } from "./reloadRepository";

const commit = (options: CommitOptions) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      if (!options.amend && !options.message) {
        dispatch(SHOW_ALERT({ type: "warning", message: "Input commit message" }));
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
        dispatch(SHOW_ALERT({ type: "warning", message: "Nothing to commit." }));
        return false;
      }
      if (stat.stagedFiles.find((f) => f.statusCode === "U")) {
        dispatch(SHOW_ALERT({ type: "warning", message: "One or more files are still unmerged." }));
        return false;
      }
      await dispatchBrowser("commit", { repoPath, options });
      await dispatch(RELOAD_REPOSITORY());
      return true;
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
      return false;
    }
  };
};

export const COMMIT = commit;
