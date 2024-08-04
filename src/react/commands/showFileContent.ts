import { useShowFileContent } from "@/hooks/actions/showFileContent";
import { FileCommand } from "./types";
import { useMemo } from "react";

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
        void showFileContent(commit, file);
      }
    }),
    [showFileContent]
  );
};
