import showFileContent_ from "@/store/thunk/showFileContent";
import { FileCommand } from "./types";

export const showFileContent: FileCommand = {
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
    dispatch(showFileContent_(commit, file));
  }
};
