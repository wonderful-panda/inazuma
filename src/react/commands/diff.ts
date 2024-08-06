import { shortHash } from "@/util";
import { FileCommand } from "./types";
import { useMemo } from "react";
import { useShowExternalDiff } from "@/hooks/actions/showExternalDiff";

const $path = (_: Commit, file: FileEntry) => file.path;
const $oldPathOrPath = (_: Commit, file: FileEntry) => file.oldPath ?? file.path;
const $localPath = (_: Commit, __: FileEntry, localPath: string) => localPath;

const $nthParent = (index: number) => (commit: Commit) => commit.parentIds[index];
const $targetRevspec = (commit: Commit, file: FileEntry) => {
  if (commit.id === "--") {
    return file.kind?.type === "staged" ? "STAGED" : "UNSTAGED";
  } else {
    return commit.id;
  }
};
const $const = (value: string) => () => value;

interface DiffCommandOption {
  id: string;
  label: string;
  allowUnmerged?: boolean;
  allowUnstaged?: boolean;
  allowStaged?: boolean;
  allowCommitted?: boolean;
  disabledStatusCodes: string[];
  leftPath: (commit: Commit, file: FileEntry, localPath: string) => string;
  rightPath: (commit: Commit, file: FileEntry, localPath: string) => string;
  leftRevspec: (commit: Commit, file: FileEntry) => string | undefined;
  rightRevspec: (commit: Commit, file: FileEntry) => string;
}

const useDiffCommand = (opt: DiffCommandOption) => {
  const showExternalDiff = useShowExternalDiff();
  return useMemo<FileCommand>(() => {
    return {
      type: "file",
      id: opt.id,
      label: opt.label,
      icon: "octicon:git-compare-16",
      hidden: (commit, file) => {
        if (commit.id === "--") {
          if (!opt.allowUnmerged && file.kind?.type === "unmerged") {
            return true;
          }
          if (!opt.allowUnstaged && file.kind?.type === "unstaged") {
            return true;
          }
          if (!opt.allowStaged && file.kind?.type === "staged") {
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
      disabled: (_, file) => opt.disabledStatusCodes.includes(file.statusCode),
      handler: (commit, file, localPath) => {
        const leftPath = opt.leftPath(commit, file, localPath);
        const rightPath = opt.rightPath(commit, file, localPath);
        const leftRevspec = opt.leftRevspec(commit, file);
        const rightRevspec = opt.rightRevspec(commit, file);
        if (leftRevspec) {
          void showExternalDiff(
            { path: leftPath, revspec: leftRevspec },
            { path: rightPath, revspec: rightRevspec }
          );
        }
      }
    };
  }, [opt, showExternalDiff]);
};

const diffWithParentOpt: DiffCommandOption = {
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
};
export const useDiffWithParentCommand = () => useDiffCommand(diffWithParentOpt);

const diffWithParent2Opt: DiffCommandOption = {
  id: "DiffWithParent:2",
  label: "Compare with second parent",
  allowUnmerged: true,
  allowStaged: true,
  disabledStatusCodes: ["A", "D"],
  leftPath: $oldPathOrPath,
  leftRevspec: $nthParent(1),
  rightPath: $path,
  rightRevspec: $targetRevspec
};
export const useDiffWithParent2Command = () => useDiffCommand(diffWithParent2Opt);

const diffWithLocalOpt: DiffCommandOption = {
  id: "DiffWithLocal",
  label: "Compare with local",
  allowCommitted: true,
  disabledStatusCodes: ["D"],
  leftPath: $path,
  leftRevspec: $targetRevspec,
  rightPath: $localPath,
  rightRevspec: $const("UNSTAGED")
};
export const useDiffWithLocalCommand = () => useDiffCommand(diffWithLocalOpt);

const useDiffUnstagedOpt: DiffCommandOption = {
  id: "DiffUnstaged",
  label: "Compare with Staged",
  allowUnstaged: true,
  disabledStatusCodes: ["?", "D"],
  leftPath: $path,
  leftRevspec: $const("STAGED"),
  rightPath: $path,
  rightRevspec: $const("UNSTAGED")
};
export const useDiffUnstagedCommand = () => useDiffCommand(useDiffUnstagedOpt);

export const useDiffAgainstCommand = (from: Commit | "parent") => {
  const opt = useMemo(
    () =>
      from === "parent"
        ? diffWithParentOpt
        : {
            id: `DiffAgainst-${from.id}`,
            label: `Compare with ${shortHash(from.id)}`,
            allowCommitted: true,
            disabledStatusCodes: ["D"],
            leftPath: $oldPathOrPath,
            leftRevspec: $const(from.id),
            rightPath: $path,
            rightRevspec: $targetRevspec
          },
    [from]
  );
  return useDiffCommand(opt);
};
