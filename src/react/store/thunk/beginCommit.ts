import browserApi from "@/browserApi";
import { serializeError } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ALERT, SHOW_ERROR } from "../misc";
import { OPEN_DIALOG } from "../repository";

const beginCommit = () => {
  return async (dispatch: Dispatch, getState: () => RootState): Promise<void> => {
    try {
      const state = getState();
      const repoPath = state.repository.path;
      if (!repoPath) {
        return;
      }
      const stat = await browserApi.getLogDetail({ repoPath, sha: "--" });
      if (stat.type !== "status") {
        throw new Error("stat.type must be 'status'");
      }
      if (stat.stagedFiles.length === 0) {
        dispatch(SHOW_ALERT({ type: "warning", message: "Nothing to commit." }));
        return;
      }
      if (stat.stagedFiles.find((f) => f.statusCode === "U")) {
        dispatch(SHOW_ALERT({ type: "warning", message: "One or more files are still unmerged." }));
        return;
      }
      dispatch(OPEN_DIALOG({ dialog: "commit" }));
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

export const BEGIN_COMMIT = beginCommit;
