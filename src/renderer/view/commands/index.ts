import { remote, MenuItemConstructorOptions } from "electron";
const { Menu } = remote;
import { CommitCommand, FileCommand } from "./types";
import { AppStore } from "../store";
import { commitCommandBrowseTree } from "./commitCommandBrowseTree";
import { commitCommandYankHash } from "./commitCommandYankHash";
import {
  fileCommandDiffWithParent,
  fileCommandDiffWithLocal
} from "./fileCommandDiff";
import { fileCommandYankPath } from "./fileCommandYankPath";
import { fileCommandBlame, fileCommandBlameParent } from "./fileCommandBlame";

const commitCommands: CommitCommand[] = [
  commitCommandYankHash,
  commitCommandBrowseTree
];

const fileCommands: FileCommand[] = [
  fileCommandYankPath,
  fileCommandDiffWithParent,
  fileCommandDiffWithLocal,
  fileCommandBlame,
  fileCommandBlameParent
];

export function executeCommitCommand(
  command: CommitCommand,
  store: AppStore,
  commit: Commit
) {
  const available = command.isEnabled || command.isVisible || (() => true);
  if (!available(commit)) {
    return;
  }
  command.handler(store, commit);
}

export function executeFileCommand(
  command: FileCommand,
  store: AppStore,
  commit: Commit,
  file: FileEntry,
  path: string
) {
  const available = command.isEnabled || command.isVisible || (() => true);
  if (!available(commit, file, path)) {
    return;
  }
  command.handler(store, commit, file, path);
}

function getCommitMenuTemplate(
  store: AppStore,
  commit: Commit
): MenuItemConstructorOptions[] {
  if (commit.id === "--") {
    return [];
  }
  const commands = commitCommands.filter(
    c => c.isVisible === undefined || c.isVisible(commit)
  );
  if (commands.length === 0) {
    return [];
  }
  return commands.map(
    c =>
      ({
        id: c.id,
        label: c.label,
        enabled: c.isEnabled === undefined || c.isEnabled(commit),
        click: () => {
          executeCommitCommand(c, store, commit);
        }
      } as MenuItemConstructorOptions)
  );
}

function getFileMenuTemplate(
  store: AppStore,
  commit: Commit,
  file: FileEntry,
  path: string
): MenuItemConstructorOptions[] {
  if (commit.id === "--") {
    return [];
  }
  const commands = fileCommands.filter(
    c => c.isVisible === undefined || c.isVisible(commit, file, path)
  );
  if (commands.length === 0) {
    return [];
  }
  return commands.map(
    c =>
      ({
        id: c.id,
        label: c.label,
        enabled: c.isEnabled === undefined || c.isEnabled(commit, file, path),
        click: () => {
          executeFileCommand(c, store, commit, file, path);
        }
      } as MenuItemConstructorOptions)
  );
}

export function showCommitContextMenu(store: AppStore, commit: Commit) {
  const template = getCommitMenuTemplate(store, commit);
  if (template.length === 0) {
    return;
  }
  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: remote.getCurrentWindow() });
}

export function showFileContextMenu(
  store: AppStore,
  commit: Commit,
  file: FileEntry,
  path: string,
  includeCommitMenus: boolean = false
) {
  const template = getFileMenuTemplate(store, commit, file, path);
  if (includeCommitMenus) {
    const commitMenuTemplate = getCommitMenuTemplate(store, commit);
    if (template.length > 0 && commitMenuTemplate.length > 0) {
      template.push({ type: "separator" });
    }
    template.push(...commitMenuTemplate);
  }
  if (template.length === 0) {
    return;
  }
  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: remote.getCurrentWindow() });
}
