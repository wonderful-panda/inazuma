import { FileCommand } from "./types";
import { store, rootModule } from "../store";
const rootCtx = rootModule.context(store);

export const fileCommandBlame: FileCommand = {
  id: "Blame",
  label: "View(blame) this version",
  isVisible(_, file) {
    return file.statusCode !== "D";
  },
  handler(commit, file) {
    rootCtx.dispatch("showFileTab", { sha: commit.id, relPath: file.path });
  }
};

export const fileCommandBlameParent: FileCommand = {
  id: "BlameParent",
  label: "View(blame) previous version",
  isVisible(commit, file) {
    return commit.parentIds.length > 0 && file.statusCode !== "A";
  },
  handler(commit, file) {
    rootCtx.dispatch("showFileTab", {
      sha: commit.parentIds[0],
      relPath: file.oldPath || file.path
    });
  }
};
