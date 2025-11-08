import { useMemo } from "react";
import { useAlert } from "@/context/AlertContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import type { FileCommand } from "./types";

export const useCopyRelativePathCommand = () => {
  const { showSuccess } = useAlert();
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
