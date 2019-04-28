import { CommitCommand } from "./types";
import * as Electron from "electron";
import { store, rootModule } from "../store";
const rootCtx = rootModule.context(store);

export const commitCommandYankHash: CommitCommand = {
  id: "YankHash",
  label: "Copy full hash to clipboard",
  handler(commit) {
    Electron.clipboard.writeText(commit.id);
    rootCtx.dispatch("showNotification", { message: `Copied: ${commit.id}` });
  }
};
