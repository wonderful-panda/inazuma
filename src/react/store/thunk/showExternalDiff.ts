import browserApi from "@/browserApi";
import { serializeError } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ALERT, SHOW_ERROR } from "../misc";

const showExternalDiff = (left: FileSpec, right: FileSpec) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const repoPath = state.repository.path;
      if (!repoPath) {
        return;
      }
      const externalDiffTool = state.persist.config.externalDiffTool;
      if (!externalDiffTool) {
        dispatch(SHOW_ALERT({ type: "warning", message: "External diff tool is not configured" }));
        return;
      }
      await browserApi.showExternalDiff({ repoPath, left, right });
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

export default showExternalDiff;
