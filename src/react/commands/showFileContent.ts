import { SHOW_FILE_CONTENT } from "@/store/thunk/showFileContent";
import { FileCommand } from "./types";

export const showFileContent: FileCommand = {
  type: "file",
  id: "showFileContent",
  label: "Show file content",
  icon: "octicon:file-code-16",
  hidden: (commit, file) => {
    if (commit.id === "--" || file.statusCode === "D") {
      return true;
    }
    return false;
  },
  handler(dispatch, commit, file) {
    dispatch(SHOW_FILE_CONTENT(commit, file));
  }
};
