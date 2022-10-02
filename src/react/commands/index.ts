import { Dispatch } from "@/store";
import { browseSourceTree } from "./browseSourceTree";
import { copyFullHash, copyShortHash } from "./copyHash";
import { diffStaged, diffUnstaged, diffWithLocal, diffWithParent } from "./diff";
import { showFileContent } from "./showFileContent";
import { stage, unstage } from "./workingtree";
import { ActionItem, CommitCommand, FileCommand } from "./types";

export const commitCommands = [copyFullHash, copyShortHash, browseSourceTree];

export const fileCommands = [
  stage,
  unstage,
  diffWithParent,
  diffWithLocal,
  diffStaged,
  diffUnstaged,
  showFileContent
];

export const executeCommitCommand = (
  command: CommitCommand,
  dispatch: Dispatch,
  commit: Commit
) => {
  if (command.hidden?.(commit) || command.disabled?.(commit)) {
    return false;
  }
  command.handler(dispatch, commit);
  return true;
};

export const executeCommand = (
  command: CommitCommand | FileCommand,
  dispatch: Dispatch,
  commit: Commit,
  file: FileEntry,
  localPath?: string
) => {
  if (command.hidden?.(commit, file) || command.disabled?.(commit, file)) {
    return false;
  }
  command.handler(dispatch, commit, file, localPath || file.path);
  return true;
};

export const executeFileCommand = (
  command: FileCommand,
  dispatch: Dispatch,
  commit: Commit,
  file: FileEntry,
  localPath?: string
) => {
  return executeCommand(command, dispatch, commit, file, localPath);
};

export const commitCommandsToActions = (
  dispatch: Dispatch,
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
      const handler = () => executeCommitCommand(c, dispatch, commit);
      return { id, label, icon, disabled, handler };
    });
  return actions;
};

export const commandsToActions = (
  dispatch: Dispatch,
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
      const handler = () => executeCommand(c, dispatch, commit, file, localPath);
      return { id, label, icon, disabled, handler };
    });
  return actions;
};

export const fileCommandsToActions = (
  dispatch: Dispatch,
  commands: readonly FileCommand[] | undefined,
  commit: Commit,
  file: FileEntry,
  localPath?: string
): ActionItem[] => {
  return commandsToActions(dispatch, commands, commit, file, localPath);
};
