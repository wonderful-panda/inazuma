import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Dispatch, RootState } from "..";
import { SHOW_WARNING } from "../misc";
import { RELOAD_REPOSITORY } from "./repository";
import { withHandleError } from "./withHandleError";
import { withLoading } from "./withLoading";

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
    if (options.commitType === "normal" && stat.files.every((f) => f.kind.type !== "staged")) {
      dispatch(SHOW_WARNING("Nothing to commit"));
      return false;
    }
    if (stat.files.some((f) => f.statusCode === "U")) {
      dispatch(SHOW_WARNING("One or more files are still unmerged"));
      return false;
    }
    await invokeTauriCommand("commit", { repoPath, options });
    await dispatch(RELOAD_REPOSITORY());
    return true;
  };
};

const fixup = (
  showConfirmDialog: (payload: { title: string; content: string }) => Promise<boolean>
) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    const ret = await showConfirmDialog({
      title: "Fixup",
      content: "Meld staged changes into last commit without changing message"
    });
    if (!ret) {
      return;
    }
    dispatch(COMMIT({ commitType: "amend" }));
  };
};

export const COMMIT = withLoading(withHandleError(commit));
export const FIXUP = fixup;
