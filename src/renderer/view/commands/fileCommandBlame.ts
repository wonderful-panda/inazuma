import { FileCommand } from "./types";
import { useRootModule } from "../store";
const rootCtx = useRootModule();

export const fileCommandBlame: FileCommand = {
  id: "Blame",
  icon: "CodeTags",
  label: "View(blame) this version",
  disabled(_, file) {
    return file.statusCode === "D";
  },
  handler(commit, file) {
    rootCtx.dispatch("showFileTab", { sha: commit.id, relPath: file.path });
  }
};

export const fileCommandBlameParent: FileCommand = {
  id: "BlameParent",
  label: "View(blame) previous version",
  icon: "CodeTags",
  disabled(commit, file) {
    return commit.parentIds.length === 0 || file.statusCode === "A";
  },
  handler(commit, file) {
    rootCtx.dispatch("showFileTab", {
      sha: commit.parentIds[0],
      relPath: file.oldPath || file.path
    });
  }
};
