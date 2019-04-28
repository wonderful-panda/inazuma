import { FileCommand } from "./types";
import * as Electron from "electron";

import { store, rootModule } from "../store";

const rootCtx = rootModule.context(store);

export const fileCommandYankPath: FileCommand = {
  id: "YankPath",
  label: "Copy path to clipboard",
  handler(_, file) {
    Electron.clipboard.writeText(file.path);
    rootCtx.dispatch("showNotification", { message: `Copied: ${file.path}` });
  }
};
