import { SHOW_EXTERNAL_DIFF } from "@/store/thunk/showExternalDiff";
import { FileCommand } from "./types";

export const diffWithParent: FileCommand = {
  id: "DiffWithParent",
  label: "Compare with parent",
  icon: "octicon:git-compare-16",
  hidden: (commit, file) => {
    if (commit.id === "--" || commit.parentIds.length === 0) {
      return true;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return true;
    }
    return false;
  },
  handler(dispatch, commit, file) {
    dispatch(
      SHOW_EXTERNAL_DIFF(
        { path: file.oldPath || file.path, revspec: commit.id + "~1" },
        { path: file.path, revspec: commit.id }
      )
    );
  }
};

export const diffWithLocal: FileCommand = {
  id: "DiffWithLocal",
  label: "Compare with local",
  icon: "octicon:git-compare-16",
  hidden(commit, file) {
    if (commit.id === "--" || file.statusCode === "D") {
      return true;
    }
    return false;
  },
  handler(dispatch, commit, file, localPath) {
    dispatch(
      SHOW_EXTERNAL_DIFF(
        { path: file.path, revspec: commit.id },
        { path: localPath, revspec: "UNSTAGED" }
      )
    );
  }
};

export const diffUnstaged: FileCommand = {
  id: "DiffUnstaged",
  label: "Compare with Staged",
  icon: "octicon:git-compare-16",
  hidden(commit, file) {
    if (commit.id !== "--" || !file.unstaged) {
      return true;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return true;
    }
    return false;
  },
  handler(dispatch, _, file, localPath) {
    dispatch(
      SHOW_EXTERNAL_DIFF(
        { path: file.path, revspec: "STAGED" },
        { path: localPath, revspec: "UNSTAGED" }
      )
    );
  }
};

export const diffStaged: FileCommand = {
  id: "DiffStaged",
  label: "Compare with HEAD",
  icon: "octicon:git-compare-16",
  hidden(commit, file) {
    if (commit.id !== "--" || !!file.unstaged) {
      return true;
    }
    if (file.statusCode === "A" || file.statusCode === "D") {
      return true;
    }
    return false;
  },
  handler(dispatch, _, file, localPath) {
    dispatch(
      SHOW_EXTERNAL_DIFF(
        { path: file.path, revspec: "HEAD" },
        { path: localPath, revspec: "STAGED" }
      )
    );
  }
};
