import { FileCommand } from "./types";
import { store, rootModule } from "../store";

const rootCtx = rootModule.context(store);

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
  handler(commit, file) {
    rootCtx.actions.showExternalDiff({
      left: { path: file.oldPath || file.path, sha: commit.id + "~1" },
      right: { path: file.path, sha: commit.id }
    });
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
  handler(commit, file, path) {
    rootCtx.actions.showExternalDiff({
      left: { path: file.path, sha: commit.id },
      right: { path, sha: "UNSTAGED" }
    });
  }
};

export const fileCommandDiffUnstaged: FileCommand = {
  id: "DiffUnstaged",
  label: "Compare with Staged",
  isVisible(commit, file) {
    if (commit.id !== "--") {
      return false;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return false;
    }
    return true;
  },
  handler(_, file, path) {
    rootCtx.actions.showExternalDiff({
      left: { path: file.path, sha: "STAGED" },
      right: { path, sha: "UNSTAGED" }
    });
  }
};

export const fileCommandDiffStaged: FileCommand = {
  id: "DiffUnstaged",
  label: "Compare with Staged",
  isVisible(commit, file) {
    if (commit.id !== "--") {
      return false;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return false;
    }
    return true;
  },
  handler(_, file, path) {
    rootCtx.actions.showExternalDiff({
      left: { path: file.path, sha: "HEAD" },
      right: { path, sha: "STAGED" }
    });
  }
};
