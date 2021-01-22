import { CommitCommand, FileCommand } from "./types";
import { commitCommandBrowseTree } from "./commitCommandBrowseTree";
import { commitCommandYankHash } from "./commitCommandYankHash";
import {
  fileCommandDiffWithParent,
  fileCommandDiffWithParentInternal,
  fileCommandDiffWithLocal
} from "./fileCommandDiff";
import { fileCommandYankPath } from "./fileCommandYankPath";
import { fileCommandBlame, fileCommandBlameParent } from "./fileCommandBlame";
import { ContextMenuItem } from "view/components/injection/contextMenu";

const commitCommands: CommitCommand[] = [commitCommandYankHash, commitCommandBrowseTree];

const fileCommands: FileCommand[] = [
  fileCommandYankPath,
  fileCommandDiffWithParent,
  fileCommandDiffWithParentInternal,
  fileCommandDiffWithLocal,
  fileCommandBlame,
  fileCommandBlameParent
];

export function executeCommitCommand(command: CommitCommand, commit: Commit) {
  const available = command.isEnabled || command.isVisible || (() => true);
  if (!available(commit)) {
    return;
  }
  command.handler(commit);
}

export function executeFileCommand(
  command: FileCommand,
  commit: Commit,
  file: FileEntry,
  path: string
) {
  const available = command.isEnabled || (() => true);
  if (!available(commit, file, path)) {
    return;
  }
  command.handler(commit, file, path);
}

export function getCommitContextMenuItems(commit: Commit): ContextMenuItem[] {
  if (commit.id === "--") {
    return [];
  }
  const commands = commitCommands.filter((c) => c.isVisible === undefined || c.isVisible(commit));
  if (commands.length === 0) {
    return [];
  }
  return commands.map((c) => ({
    id: c.id,
    label: c.label,
    disabled: c.isEnabled !== undefined && !c.isEnabled(commit),
    action: () => executeCommitCommand(c, commit)
  }));
}

export function getFileContextMenuItems(
  commit: Commit,
  file: FileEntry,
  path: string,
  includeCommitMenus = false
): ContextMenuItem[] {
  if (commit.id === "--") {
    return [];
  }
  const ret = fileCommands.map(
    (c) =>
      ({
        id: c.id,
        label: c.label,
        disabled: c.isEnabled !== undefined && !c.isEnabled(commit, file, path),
        action: () => {
          executeFileCommand(c, commit, file, path);
        }
      } as ContextMenuItem)
  );
  if (includeCommitMenus) {
    ret.push("separator", ...getCommitContextMenuItems(commit));
  }
  return ret;
}

