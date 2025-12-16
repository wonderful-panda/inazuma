import { useCallback, useContext } from "react";
import type { CustomCommand } from "@backend/CustomCommand";
import {
  commitCommandsToActions,
  fileCommandsToActions,
  useCommitCommands,
  useFileCommands
} from "@/commands";
import type { ActionItem } from "@/commands/types";
import { ContextMenuContext } from "@/context/ContextMenuContext";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";
import { useCustomCommands } from "./useCustomCommands";

export const useCommitContextMenu = (): ((
  event: React.MouseEvent | MouseEvent,
  index: number,
  item: Commit
) => void) => {
  const { show } = useContext(ContextMenuContext);
  const confirmDialog = useConfirmDialog();
  const commitCommands = useCommitCommands();
  const {
    globalCommands,
    repositoryCommands,
    canExecute,
    getCommandWithContext,
    executeCommand
  } = useCustomCommands();

  const onCommitContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, commit: Commit) => {
      if (!commit) {
        return;
      }

      // Standard menu items
      const standardMenus = commitCommandsToActions(commitCommands, commit);

      // Helper to create menu item from custom command
      const createCustomMenuItem = (command: CustomCommand, source: "Global" | "Repository"): ActionItem => ({
        id: `custom-${source.toLowerCase()}-${command.name}`,
        label: `${command.description || command.name} (${source})`,
        disabled: !canExecute(command, commit),
        handler: async () => {
          // Show confirmation dialog if required
          if (command.confirmBeforeExecute) {
            const result = getCommandWithContext(command, commit);
            if (result.error) {
              console.error("Cannot execute command:", result.error);
              return;
            }

            const confirmResult = await confirmDialog.showModal({
              title: "Execute Custom Command",
              content: `Do you want to execute this command?\n\n${result.commandLine}`
            });

            if (confirmResult !== "accepted") {
              return;
            }
          }

          void executeCommand(command, commit).catch((error) => {
            console.error("Failed to execute custom command:", error);
          });
        }
      });

      // Custom command menu items
      const globalMenus: ActionItem[] = globalCommands.map((cmd) => createCustomMenuItem(cmd, "Global"));
      const repoMenus: ActionItem[] = repositoryCommands.map((cmd) => createCustomMenuItem(cmd, "Repository"));
      const customMenus: ActionItem[] = [...globalMenus, ...repoMenus];

      // Combine standard menus and custom menus with separator
      const menus: ("divider" | ActionItem)[] =
        customMenus.length > 0 ? [...standardMenus, "divider", ...customMenus] : standardMenus;

      show(event, menus);
    },
    [
      show,
      confirmDialog,
      commitCommands,
      globalCommands,
      repositoryCommands,
      canExecute,
      getCommandWithContext,
      executeCommand
    ]
  );
  return onCommitContextMenu;
};

const itself = <T>(item: T) => item;

export const useFileContextMenu = (
  commit: Commit | undefined
): ((event: React.MouseEvent | MouseEvent, index: number, item: FileEntry) => void) => {
  return useFileContextMenuT<FileEntry>(commit, itself);
};

export const useFileContextMenuT = <T>(
  commit: Commit | undefined,
  getFile: (item: T) => FileEntry | undefined
): ((event: React.MouseEvent | MouseEvent, index: number, item: T) => void) => {
  const { show } = useContext(ContextMenuContext);
  const fileCommands = useFileCommands();
  const onFileContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, item: T) => {
      if (!commit) {
        return;
      }
      const file = getFile(item);
      if (!file) {
        return;
      }
      const menus = fileCommandsToActions(fileCommands, commit, file);
      show(event, menus);
    },
    [commit, show, getFile, fileCommands]
  );
  return onFileContextMenu;
};

export const useFileCommitContextMenu = (
  localPath: string
): ((event: React.MouseEvent | MouseEvent, index: number, item: FileCommit) => void) => {
  const { show } = useContext(ContextMenuContext);
  const commitCommands = useCommitCommands();
  const fileCommands = useFileCommands();
  const onFileContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, item: FileCommit) => {
      const menus = [
        ...commitCommandsToActions(commitCommands, item),
        ...fileCommandsToActions(fileCommands, item, item, localPath)
      ];
      show(event, menus);
    },
    [show, localPath, commitCommands, fileCommands]
  );
  return onFileContextMenu;
};
