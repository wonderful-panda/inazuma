import type { MenuItemConstructorOptions } from "electron";
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
import { browserCommand } from "core/browser";
import { useRootModule } from "view/store";

const rootCtx = useRootModule();

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

function getCommitMenuTemplate(commit: Commit): MenuItemConstructorOptions[] {
  if (commit.id === "--") {
    return [];
  }
  const commands = commitCommands.filter((c) => c.isVisible === undefined || c.isVisible(commit));
  if (commands.length === 0) {
    return [];
  }
  return commands.map(
    (c) =>
      ({
        id: c.id,
        label: c.label,
        enabled: c.isEnabled === undefined || c.isEnabled(commit),
        click: () => {
          executeCommitCommand(c, commit);
        }
      } as MenuItemConstructorOptions)
  );
}

function getFileMenuTemplate(
  commit: Commit,
  file: FileEntry,
  path: string
): MenuItemConstructorOptions[] {
  if (commit.id === "--") {
    return [];
  }
  return fileCommands.map(
    (c) =>
      ({
        id: c.id,
        label: c.label,
        enabled: c.isEnabled === undefined || c.isEnabled(commit, file, path),
        click: () => {
          executeFileCommand(c, commit, file, path);
        }
      } as MenuItemConstructorOptions)
  );
}

export async function showCommitContextMenu(commit: Commit) {
  const template = getCommitMenuTemplate(commit);
  if (template.length === 0) {
    return;
  }
  try {
    await browserCommand.showContextMenu(template);
  } catch (error) {
    rootCtx.actions.showError({ error });
  }
}

export async function showFileContextMenu(
  commit: Commit,
  file: FileEntry,
  path: string,
  includeCommitMenus: boolean = false
) {
  const template = getFileMenuTemplate(commit, file, path);
  if (includeCommitMenus) {
    const commitMenuTemplate = getCommitMenuTemplate(commit);
    if (template.length > 0 && commitMenuTemplate.length > 0) {
      template.push({ type: "separator" });
    }
    template.push(...commitMenuTemplate);
  }
  if (template.length === 0) {
    return;
  }
  try {
    await browserCommand.showContextMenu(template);
  } catch (error) {
    rootCtx.actions.showError({ error });
  }
}
