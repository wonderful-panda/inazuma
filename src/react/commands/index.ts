import { useBrowseSourceTreeCommand } from "./browseSourceTree";
import { useCopyFullHashCommand, useCopyShortHashCommand } from "./copyHash";
import { ActionItem, CommitCommand, FileCommand } from "./types";
import { useCreateBranchCommand } from "./createBranch";
import { useMemo } from "react";
import { useCopyRelativePathCommand } from "./copyRelativePath";
import {
  useDiffUnstagedCommand,
  useDiffWithLocalCommand,
  useDiffWithParent2Command,
  useDiffWithParentCommand
} from "./diff";
import { useStageCommand, useUnstageCommand } from "./workingtree";
import { useShowFileContentCommand } from "./showFileContent";

export const useCommitCommands = () => {
  const copyFullHash = useCopyFullHashCommand();
  const copyShortHash = useCopyShortHashCommand();
  const browseSourceTree = useBrowseSourceTreeCommand();
  const createBranch = useCreateBranchCommand();
  return useMemo<CommitCommand[]>(
    () => [copyFullHash, copyShortHash, browseSourceTree, createBranch],
    [copyFullHash, copyShortHash, browseSourceTree, createBranch]
  );
};

export const useFileCommands = () => {
  const stage = useStageCommand();
  const unstage = useUnstageCommand();
  const copyRelativePath = useCopyRelativePathCommand();
  const diffWithParent = useDiffWithParentCommand();
  const diffWithParent2 = useDiffWithParent2Command();
  const diffWithLocal = useDiffWithLocalCommand();
  const diffUnstaged = useDiffUnstagedCommand();
  const showFileContent = useShowFileContentCommand();
  return useMemo(
    () => [
      copyRelativePath,
      stage,
      unstage,
      diffWithParent,
      diffWithParent2,
      diffWithLocal,
      diffUnstaged,
      showFileContent
    ],
    [
      copyRelativePath,
      stage,
      unstage,
      diffWithParent,
      diffWithParent2,
      diffWithLocal,
      diffUnstaged,
      showFileContent
    ]
  );
};

export const executeCommitCommand = (command: CommitCommand, commit: Commit) => {
  if (command.hidden?.(commit) || command.disabled?.(commit)) {
    return false;
  }
  command.handler(commit);
  return true;
};

export const executeCommand = (
  command: CommitCommand | FileCommand,
  commit: Commit,
  file: FileEntry,
  localPath?: string
) => {
  if (command.hidden?.(commit, file) || command.disabled?.(commit, file)) {
    return false;
  }
  if (command.type === "file") {
    command.handler(commit, file, localPath || file.path);
  } else {
    command.handler(commit);
  }
  return true;
};

export const executeFileCommand = (
  command: FileCommand,
  commit: Commit,
  file: FileEntry,
  localPath?: string
) => {
  return executeCommand(command, commit, file, localPath);
};

export const commitCommandsToActions = (
  commands: readonly CommitCommand[] | undefined,
  commit: Commit
): ActionItem[] => {
  if (!commands) {
    return [];
  }
  const actions: ActionItem[] = commands
    .filter((c) => !c.hidden?.(commit))
    .map((c) => {
      const { id, label, icon } = c;
      const disabled = c.disabled?.(commit);
      const handler = () => executeCommitCommand(c, commit);
      return { id, label, icon, disabled, handler };
    });
  return actions;
};

export const commandsToActions = (
  commands: readonly (CommitCommand | FileCommand)[] | undefined,
  commit: Commit,
  file: FileEntry,
  localPath?: string
): ActionItem[] => {
  if (!commands) {
    return [];
  }
  const actions: ActionItem[] = commands
    .filter((c) => !c.hidden?.(commit, file))
    .map((c) => {
      const { id, label, icon } = c;
      const disabled = c.disabled?.(commit, file);
      const handler = () => executeCommand(c, commit, file, localPath);
      return { id, label, icon, disabled, handler };
    });
  return actions;
};

export const fileCommandsToActions = (
  commands: readonly FileCommand[] | undefined,
  commit: Commit,
  file: FileEntry,
  localPath?: string
): ActionItem[] => {
  return commandsToActions(commands, commit, file, localPath);
};
