import { SHOW_FILE_CONTENT } from "@/store/thunk/showFileContent";
import { FileCommand } from "./types";
import { useMemo } from "react";
import { useDispatch } from "@/store";

export const useShowFileContentCommand = () => {
  const dispatch = useDispatch();
  return useMemo<FileCommand>(
    () => ({
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
      handler(commit, file) {
        dispatch(SHOW_FILE_CONTENT(commit, file));
      }
    }),
    [dispatch]
  );
};
