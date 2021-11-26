import { getFileName, serializeError, shortHash } from "@/util";
import { Dispatch, RootState } from "..";
import { SHOW_ERROR } from "../misc";
import { ADD_TAB } from "../repository";

const showFileContent = (commit: Commit, file: FileEntry) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
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
          payload: { path: file.path, sha: commit.id },
          closable: true
        })
      );
    } catch (error) {
      dispatch(SHOW_ERROR({ error: serializeError(error) }));
    }
  };
};

export const SHOW_FILE_CONTENT = showFileContent;
