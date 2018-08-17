import { CommitCommand } from "./types";
import * as Electron from "electron";

export const commitCommandYankHash: CommitCommand = {
  id: "YankHash",
  label: "Copy full hash to clipboard",
  handler(store, commit) {
    Electron.clipboard.writeText(commit.id);
    store.actions.showNotification(`Copied: ${commit.id}`);
  }
};
