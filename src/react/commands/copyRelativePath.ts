import { invokeTauriCommand } from "@/invokeTauriCommand";
import { SHOW_SUCCESS } from "@/store/misc";
import { FileCommand } from "./types";
import { useMemo } from "react";
import { useDispatch } from "@/store";

export const useCopyRelativePathCommand = () => {
  const dispatch = useDispatch();
  return useMemo<FileCommand>(
    () => ({
      type: "file",
      id: "CopyRelativePath",
      label: "Copy relative path",
      icon: "mdi:content-copy",
      handler: async (_, file) => {
        await invokeTauriCommand("yank_text", { text: file.path });
        dispatch(SHOW_SUCCESS(`Copied: ${file.path}`));
      }
    }),
    [dispatch]
  );
};
