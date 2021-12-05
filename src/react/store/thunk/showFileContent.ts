import { getFileName, shortHash } from "@/util";
import { Dispatch, RootState } from "..";
import { ADD_TAB } from "../repository";
import { withHandleError } from "./withHandleError";

const showFileContent = (commit: Commit, file: FileEntry) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const repoPath = state.repository.path;
    if (!repoPath) {
      return;
    }
    if (file.statusCode === "D") {
      return;
    }
    dispatch(
      ADD_TAB({
        type: "file",
        id: `blame:${commit.id}/${file.path}`,
        title: `${getFileName(file.path)} @ ${shortHash(commit.id)}`,
        payload: { path: file.path, commit },
        closable: true
      })
    );
  };
};

export const SHOW_FILE_CONTENT = withHandleError(showFileContent);
