import { FileCommand } from "./types";
import { useRootModule } from "../store";

const rootCtx = useRootModule();

export const fileCommandDiffWithParent: FileCommand = {
  id: "DiffWithParent",
  label: "Compare with parent",
  icon: "CompareHorizontal",
  disabled(commit, file) {
    if (commit.parentIds.length === 0) {
      return true;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return true;
    }
    return false;
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
  icon: "CompareHorizontal",
  disabled(commit, file) {
    if (commit.parentIds.length === 0) {
      return true;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return true;
    }
    return false;
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
  icon: "CompareHorizontal",
  disabled(_, file) {
    if (file.statusCode === "D") {
      return true;
    }
    return false;
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
  icon: "CompareHorizontal",
  disabled(commit, file) {
    if (commit.id !== "--") {
      return true;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return true;
    }
    return false;
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
  icon: "CompareHorizontal",
  disabled(commit, file) {
    if (commit.id !== "--") {
      return true;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return true;
    }
    return false;
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
  disabled(commit, file) {
    if (commit.id !== "--") {
      return true;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return true;
    }
    if (file.insertions === "-" && file.deletions === "-") {
      return true;
    }
    return false;
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
  disabled(commit, file) {
    if (commit.id !== "--") {
      return true;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return true;
    }
    if (file.insertions === "-" && file.deletions === "-") {
      return true;
    }
    return false;
  },
  handler(_, file, path) {
    rootCtx.actions.showDiffTab({
      left: { path: file.path, revspec: "HEAD" },
      right: { path, revspec: "STAGED" }
    });
  }
};
