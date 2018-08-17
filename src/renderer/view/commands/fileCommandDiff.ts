import { FileCommand } from "./types";

export const fileCommandDiffWithParent: FileCommand = {
  id: "DiffWithParent",
  label: "Compare with parent",
  isVisible(commit, file) {
    if (commit.parentIds.length === 0) {
      return false;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return false;
    }
    return true;
  },
  handler(store, commit, file) {
    store.actions.showExternalDiff(
      { path: file.oldPath || file.path, sha: commit.id + "~1" },
      { path: file.path, sha: commit.id }
    );
  }
};

export const fileCommandDiffWithLocal: FileCommand = {
  id: "DiffWithLocal",
  label: "Compare with local",
  isVisible(_, file) {
    if (file.statusCode === "D") {
      return false;
    }
    return true;
  },
  handler(store, commit, file, path) {
    store.actions.showExternalDiff(
      { path: file.path, sha: commit.id },
      { path, sha: "UNSTAGED" }
    );
  }
};
