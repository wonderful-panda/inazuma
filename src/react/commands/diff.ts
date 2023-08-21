import { SHOW_EXTERNAL_DIFF } from "@/store/thunk/showExternalDiff";
import { shortHash } from "@/util";
import { FileCommand } from "./types";

const $path = (_: Commit, file: FileEntry) => file.path;
const $oldPathOrPath = (_: Commit, file: FileEntry) => file.oldPath || file.path;
const $localPath = (_: Commit, __: FileEntry, localPath: string) => localPath;

const $nthParent = (index: number) => (commit: Commit) => commit.parentIds[index];
const $targetRevspec = (commit: Commit, file: FileEntry) => {
  if (commit.id === "--") {
    return file.unstaged ? "UNSTAGED" : "STAGED";
  } else {
    return commit.id;
  }
};
const $const = (value: string) => () => value;

type DiffCommandOption = {
  id: string;
  label: string;
  allowUnmerged?: boolean;
  allowUnstaged?: boolean;
  allowStaged?: boolean;
  allowCommitted?: boolean;
  disabledStatusCodes: string[];
  leftPath: (commit: Commit, file: FileEntry, localPath: string) => string;
  rightPath: (commit: Commit, file: FileEntry, localPath: string) => string;
  leftRevspec: (commit: Commit, file: FileEntry) => string;
  rightRevspec: (commit: Commit, file: FileEntry) => string;
};

const createDiffCommand = (opt: DiffCommandOption): FileCommand => {
  return {
    id: opt.id,
    label: opt.label,
    icon: "octicon:git-compare-16",
    hidden: (commit, file) => {
      if (commit.id === "--") {
        if (!opt.allowUnmerged && file.statusCode === "U") {
          return true;
        }
        if (!opt.allowUnstaged && file.statusCode !== "U" && file.unstaged) {
          return true;
        }
        if (!opt.allowStaged && file.statusCode !== "U" && !file.unstaged) {
          return true;
        }
      } else {
        if (!opt.allowCommitted) {
          return true;
        }
      }
      if (!opt.leftRevspec(commit, file) || !opt.rightRevspec(commit, file)) {
        return true;
      }
      return false;
    },
    disabled: (_, file) => opt.disabledStatusCodes.indexOf(file.statusCode) >= 0,
    handler: (dispatch, commit, file, localPath) => {
      const leftPath = opt.leftPath(commit, file, localPath);
      const rightPath = opt.rightPath(commit, file, localPath);
      const leftRevspec = opt.leftRevspec(commit, file);
      const rightRevspec = opt.rightRevspec(commit, file);
      dispatch(
        SHOW_EXTERNAL_DIFF(
          { path: leftPath, revspec: leftRevspec },
          { path: rightPath, revspec: rightRevspec }
        )
      );
    }
  };
};

export const diffWithParent = createDiffCommand({
  id: "DiffWithParent",
  label: "Compare with parent",
  allowUnmerged: true,
  allowStaged: true,
  allowCommitted: true,
  disabledStatusCodes: ["A", "D"],
  leftPath: $oldPathOrPath,
  leftRevspec: $nthParent(0),
  rightPath: $path,
  rightRevspec: $targetRevspec
});

export const diffWithParent2 = createDiffCommand({
  id: "DiffWithParent:2",
  label: "Compare with second parent",
  allowUnmerged: true,
  allowStaged: true,
  disabledStatusCodes: ["A", "D"],
  leftPath: $oldPathOrPath,
  leftRevspec: $nthParent(1),
  rightPath: $path,
  rightRevspec: $targetRevspec
});

export const diffWithLocal = createDiffCommand({
  id: "DiffWithLocal",
  label: "Compare with local",
  allowCommitted: true,
  disabledStatusCodes: ["D"],
  leftPath: $path,
  leftRevspec: $targetRevspec,
  rightPath: $localPath,
  rightRevspec: $const("UNSTAGED")
});

export const diffUnstaged = createDiffCommand({
  id: "DiffUnstaged",
  label: "Compare with Staged",
  allowUnstaged: true,
  disabledStatusCodes: ["?", "D"],
  leftPath: $path,
  leftRevspec: $const("STAGED"),
  rightPath: $path,
  rightRevspec: $const("UNSTAGED")
});

export const diffAgainst = (baseCommit: Commit) =>
  createDiffCommand({
    id: `DiffAgainst-${baseCommit.id}`,
    label: `Compare with ${shortHash(baseCommit.id)}`,
    allowCommitted: true,
    disabledStatusCodes: ["D"],
    leftPath: $oldPathOrPath,
    leftRevspec: $const(baseCommit.id),
    rightPath: $path,
    rightRevspec: $targetRevspec
  });
