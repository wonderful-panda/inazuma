import { FileCommand } from "./types";
import * as Electron from "electron";

export const fileCommandYankPath: FileCommand = {
  id: "YankPath",
  label: "Copy path to clipboard",
  handler(store, _, file) {
    Electron.clipboard.writeText(file.path);
    store.actions.showNotification(`Copied: ${file.path}`);
  }
};
