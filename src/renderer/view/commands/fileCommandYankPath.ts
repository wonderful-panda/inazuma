import { FileCommand } from "./types";
import * as Electron from "electron";

import { useRootModule } from "../store";

const rootCtx = useRootModule();

export const fileCommandYankPath: FileCommand = {
  id: "YankPath",
  label: "Copy path to clipboard",
  handler(_, file) {
    Electron.clipboard.writeText(file.path);
    rootCtx.dispatch("showNotification", { message: `Copied: ${file.path}` });
  }
};
