import { SHOW_EXTERNAL_DIFF } from "@/store/thunk/showExternalDiff";
import { shortHash } from "@/util";
import { FileCommand } from "./types";

export const diffWithParent: FileCommand = {
  id: "DiffWithParent",
  label: "Compare with parent",
  icon: "octicon:git-compare-16",
  hidden: (commit) => {
    if (commit.id === "--" || commit.parentIds.length === 0) {
      return true;
    }
    return false;
  },
  disabled(_, file) {
    return file.statusCode === "A" || file.statusCode === "D";
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
  hidden(commit) {
    if (commit.id === "--") {
      return true;
    }
    return false;
  },
  disabled(_, file) {
    return file.statusCode === "D";
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
    return false;
  },
  disabled(_, file) {
    return file.statusCode === "A" || file.statusCode === "D" || file.statusCode === "?";
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
    return false;
  },
  disabled(_, file) {
    return file.statusCode === "A" || file.statusCode === "D";
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

export const diffAgainst = (baseCommit: Commit): FileCommand => ({
  id: `DiffAgainst-${baseCommit.id}`,
  label: `Compare with ${shortHash(baseCommit.id)}`,
  icon: "octicon:git-compare-16",
  hidden: (commit) => {
    if (commit.id === "--" || commit.parentIds.length === 0) {
      return true;
    }
    return false;
  },
  disabled(_, file) {
    return file.statusCode === "A" || file.statusCode === "D";
  },
  handler(dispatch, commit, file) {
    dispatch(
      SHOW_EXTERNAL_DIFF(
        { path: file.oldPath || file.path, revspec: baseCommit.id },
        { path: file.path, revspec: commit.id }
      )
    );
  }
});
