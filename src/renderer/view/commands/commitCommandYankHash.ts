import { CommitCommand } from "./types";
import { useRootModule } from "../store";
import { browserCommand } from "core/browser";
const rootCtx = useRootModule();

export const commitCommandYankHash: CommitCommand = {
  id: "YankHash",
  label: "Copy full hash to clipboard",
  async handler(commit) {
    try {
      await browserCommand.yankText(commit.id);
      rootCtx.dispatch("showNotification", { message: `Copied: ${commit.id}` });
    } catch (error) {
      rootCtx.actions.showError({ error });
    }
  }
};
