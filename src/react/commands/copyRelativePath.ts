import { invokeTauriCommand } from "@/invokeTauriCommand";
import { FileCommand } from "./types";
import { useMemo } from "react";
import { useShowSuccess } from "@/state/root";

export const useCopyRelativePathCommand = () => {
  const showSuccess = useShowSuccess();
  return useMemo<FileCommand>(
    () => ({
      type: "file",
      id: "CopyRelativePath",
      label: "Copy relative path",
      icon: "mdi:content-copy",
      handler: async (_, file) => {
        await invokeTauriCommand("yank_text", { text: file.path });
        showSuccess(`Copied: ${file.path}`);
      }
    }),
    [showSuccess]
  );
};
