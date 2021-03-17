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

export function executeCommitCommand(command: CommitCommand, commit: DagNode) {
  if (command.disabled?.(commit)) {
    return;
  }
  command.handler(commit);
}

export function executeFileCommand(
  command: FileCommand,
  commit: DagNode,
  file: FileEntry,
  path: string
) {
  if (command.disabled?.(commit, file, path)) {
    return;
  }
  command.handler(commit, file, path);
}

export function getCommitContextMenuItems(commit: Commit): ContextMenuItem[] {
  if (commit.id === "--") {
    return [];
  }
  const commands = commitCommands.filter((c) => !c.hidden?.(commit));
  if (commands.length === 0) {
    return [];
  }
  return commands.map((c) => ({
    id: c.id,
    label: c.label,
    disabled: c.disabled?.(commit),
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
        disabled: c.disabled?.(commit, file, path),
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
