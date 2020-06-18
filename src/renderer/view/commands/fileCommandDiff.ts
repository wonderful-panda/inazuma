import { FileCommand } from "./types";
import { useRootModule } from "../store";

const rootCtx = useRootModule();

export const fileCommandDiffWithParent: FileCommand = {
  id: "DiffWithParent",
  label: "Compare with parent",
  icon: "compare_arrows",
  isEnabled(commit, file) {
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
      left: { path: file.oldPath || file.path, revspec: commit.id + "~1" },
      right: { path: file.path, revspec: commit.id }
    });
  }
};

export const fileCommandDiffWithParentInternal: FileCommand = {
  id: "DiffWithParentInternal",
  label: "Compare with parent (INTERNAL)",
  icon: "compare_arrows",
  isEnabled(commit, file) {
    if (commit.parentIds.length === 0) {
      return false;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return false;
    }
    return true;
  },
  handler(commit, file) {
    rootCtx.actions.showDiffTab({
      left: { path: file.oldPath || file.path, revspec: commit.id + "~1" },
      right: { path: file.path, revspec: commit.id }
    });
  }
};

export const fileCommandDiffWithLocal: FileCommand = {
  id: "DiffWithLocal",
  label: "Compare with local",
  icon: "compare_arrows",
  isEnabled(_, file) {
    if (file.statusCode === "D") {
      return false;
    }
    return true;
  },
  handler(commit, file, path) {
    rootCtx.actions.showExternalDiff({
      left: { path: file.path, revspec: commit.id },
      right: { path, revspec: "UNSTAGED" }
    });
  }
};

export const fileCommandDiffUnstaged: FileCommand = {
  id: "DiffUnstaged",
  label: "Compare with Staged",
  icon: "compare_arrows",
  isEnabled(commit, file) {
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
      left: { path: file.path, revspec: "STAGED" },
      right: { path, revspec: "UNSTAGED" }
    });
  }
};

export const fileCommandDiffStaged: FileCommand = {
  id: "DiffUnstaged",
  label: "Compare with HEAD",
  icon: "compare_arrows",
  isEnabled(commit, file) {
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
      left: { path: file.path, revspec: "HEAD" },
      right: { path, revspec: "STAGED" }
    });
  }
};

export const fileCommandDiffUnstagedInternal: FileCommand = {
  id: "DiffUnstaged",
  label: "Compare with Staged / Edit Staged",
  isEnabled(commit, file) {
    if (commit.id !== "--") {
      return false;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return false;
    }
    if (file.insertions === "-" && file.deletions === "-") {
      return false;
    }
    return true;
  },
  handler(_, file, path) {
    rootCtx.actions.showDiffTab({
      left: { path: file.path, revspec: "STAGED" },
      right: { path, revspec: "UNSTAGED" }
    });
  }
};

export const fileCommandDiffStagedInternal: FileCommand = {
  id: "DiffUnstaged",
  label: "Compare with HEAD / Edit Staged",
  isEnabled(commit, file) {
    if (commit.id !== "--") {
      return false;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return false;
    }
    if (file.insertions === "-" && file.deletions === "-") {
      return false;
    }
    return true;
  },
  handler(_, file, path) {
    rootCtx.actions.showDiffTab({
      left: { path: file.path, revspec: "HEAD" },
      right: { path, revspec: "STAGED" }
    });
  }
};
