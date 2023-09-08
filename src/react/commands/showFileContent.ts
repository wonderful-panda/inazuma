import { FileCommand } from "./types";
import { useMemo } from "react";
import { useShowFileContent } from "@/state/repository/tabs";

export const useShowFileContentCommand = () => {
  const showFileContent = useShowFileContent();
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
        showFileContent(commit, file);
      }
    }),
    [showFileContent]
  );
};
