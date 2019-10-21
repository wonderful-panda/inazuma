import { CommitCommand } from "./types";
import * as Electron from "electron";
import { useRootModule } from "../store";
const rootCtx = useRootModule();

export const commitCommandYankHash: CommitCommand = {
  id: "YankHash",
  label: "Copy full hash to clipboard",
  handler(commit) {
    Electron.clipboard.writeText(commit.id);
    rootCtx.dispatch("showNotification", { message: `Copied: ${commit.id}` });
  }
};
