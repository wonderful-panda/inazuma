import { useCallback, useContext } from "react";
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
  const { customCommands, canExecute, getCommandWithContext, executeCommandDetached } =
    useCustomCommands();

  const onCommitContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, commit: Commit) => {
      if (!commit) {
        return;
      }

      // Standard menu items
      const standardMenus = commitCommandsToActions(commitCommands, commit);

      // Custom command menu items
      const customMenus: ActionItem[] = customCommands.map((command) => ({
        id: `custom-${command.name}`,
        label: command.description || command.name,
        disabled: !canExecute(command, commit),
        handler: async () => {
          if (command.useBuiltinTerminal) {
            // TODO: Implement PTY dialog for custom commands
            const result = getCommandWithContext(command, commit);
            if (result.error) {
              console.error("Cannot execute command:", result.error);
              return;
            }
            console.log("Execute with PTY:", command.name, "->", result.commandLine);
          } else {
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

            void executeCommandDetached(command, commit).catch((error) => {
              console.error("Failed to execute custom command:", error);
            });
          }
        }
      }));

      // Combine standard menus and custom menus with separator
      const menus: ("divider" | ActionItem)[] =
        customMenus.length > 0 ? [...standardMenus, "divider", ...customMenus] : standardMenus;

      show(event, menus);
    },
    [
      show,
      confirmDialog,
      commitCommands,
      customCommands,
      canExecute,
      getCommandWithContext,
      executeCommandDetached
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
