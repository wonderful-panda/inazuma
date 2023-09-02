import { invokeTauriCommand } from "@/invokeTauriCommand";
import { SHOW_SUCCESS } from "@/store/misc";
import { FileCommand } from "./types";

export const copyRelativePath: FileCommand = {
  type: "file",
  id: "CopyRelativePath",
  label: "Copy relative path",
  icon: "mdi:content-copy",
  handler: async (dispatch, _, file) => {
    await invokeTauriCommand("yank_text", { text: file.path });
    dispatch(SHOW_SUCCESS(`Copied: ${file.path}`));
  }
};
