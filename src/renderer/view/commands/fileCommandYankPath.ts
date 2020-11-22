import { FileCommand } from "./types";

import { useRootModule } from "../store";
import { browserCommand } from "core/browser";

const rootCtx = useRootModule();

export const fileCommandYankPath: FileCommand = {
  id: "YankPath",
  label: "Copy path to clipboard",
  async handler(_, file) {
    try {
      await browserCommand.yankText(file.path);
      rootCtx.dispatch("showNotification", { message: `Copied: ${file.path}` });
    } catch (error) {
      rootCtx.actions.showError({ error });
    }
  }
};
