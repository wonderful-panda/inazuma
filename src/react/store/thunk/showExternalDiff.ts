import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Dispatch, RootState } from "..";
import { SHOW_WARNING } from "../misc";
import { withHandleError } from "./withHandleError";

const showExternalDiff = (
  left: FileSpec,
  right: FileSpec,
  externalDiffTool: string | undefined
) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    if (!externalDiffTool) {
      dispatch(SHOW_WARNING("External diff tool is not configured"));
      return;
    }
    await invokeTauriCommand("show_external_diff", { repoPath, left, right });
  };
};

export const SHOW_EXTERNAL_DIFF = withHandleError(showExternalDiff);
