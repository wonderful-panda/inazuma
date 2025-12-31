import type { CommitCustomCommand } from "@backend/CommitCustomCommand";
import type { FileCustomCommand } from "@backend/FileCustomCommand";
import { IconButton, Typography } from "@mui/material";
import type React from "react";
import { useCallback, useContext } from "react";
import { useAlert } from "@/core/context/AlertContext";
import { useConfirmDialog } from "@/core/context/ConfirmDialogContext";
import { ContextMenuContext } from "@/core/context/ContextMenuContext";
import type { ActionItem } from "@/core/types/actions";
import { invokeTauriCommand } from "@/core/utils/invokeTauriCommand";
import {
  commitCommandsToActions,
  fileCommandsToActions,
  useCommitCommands,
  useFileCommands
} from "@/features/repository/commands";
import { Icon } from "@/shared/components/ui/Icon";
import { useCustomCommands } from "./useCustomCommands";

const ConfirmContent: React.FC<{ commandLine: string }> = ({ commandLine }) => {
  const alert = useAlert();
  const handleCopy = useCallback(async () => {
    await invokeTauriCommand("yank_text", { text: commandLine });
    alert.showSuccess("Copied");
  }, [commandLine, alert]);
  return (
    <div className="grid max-w-160">
      <Typography variant="subtitle1">Do you want to execute this command?</Typography>
      <div className="grid grid-cols-[1fr_auto] items-center">
        <Typography
          variant="subtitle2"
          className="leading-6 text-mono mx-2 px-2 overflow-hidden ellipsis"
          title={commandLine}
        >
          {commandLine}
        </Typography>
        <IconButton size="small" onClick={handleCopy}>
          <Icon icon="mdi:content-copy" />
        </IconButton>
      </div>
    </div>
  );
};

export const useCommitContextMenu = (): ((
  event: React.MouseEvent | MouseEvent,
  index: number,
  item: Commit
) => void) => {
  const { show } = useContext(ContextMenuContext);
  const confirmDialog = useConfirmDialog();
  const commitCommands = useCommitCommands();
  const {
    globalCommitCommands,
    repositoryCommitCommands,
    canExecuteCommitCommand,
    getCommitCommandWithContext,
    executeCommitCommand
  } = useCustomCommands();

  const onCommitContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, commit: Commit) => {
      if (!commit) {
        return;
      }

      // Standard menu items
      const standardMenus = commitCommandsToActions(commitCommands, commit);

      // Helper to create menu item from custom command
      const createCustomMenuItem = (
        command: CommitCustomCommand,
        source: "Global" | "Repository"
      ): ActionItem => ({
        id: `custom-${source.toLowerCase()}-${command.name}`,
        label: `${command.description || command.name} (${source})`,
        disabled: !canExecuteCommitCommand(command, commit),
        handler: async () => {
          // Show confirmation dialog if required
          if (command.confirmBeforeExecute) {
            const result = getCommitCommandWithContext(command, commit);
            if (result.error) {
              console.error("Cannot execute command:", result.error);
              return;
            }

            const confirmResult = await confirmDialog.showModal({
              title: "Execute Custom Command",
              content: <ConfirmContent commandLine={result.commandLine} />
            });

            if (confirmResult !== "accepted") {
              return;
            }
          }

          void executeCommitCommand(command, commit).catch((error) => {
            console.error("Failed to execute custom command:", error);
          });
        }
      });

      // Custom command menu items
      const globalMenus: ActionItem[] = globalCommitCommands.map((cmd) =>
        createCustomMenuItem(cmd, "Global")
      );
      const repoMenus: ActionItem[] = repositoryCommitCommands.map((cmd) =>
        createCustomMenuItem(cmd, "Repository")
      );
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
      globalCommitCommands,
      repositoryCommitCommands,
      canExecuteCommitCommand,
      getCommitCommandWithContext,
      executeCommitCommand
    ]
  );
  return onCommitContextMenu;
};

const itself = <T,>(item: T) => item;

export const useFileContextMenu = (
  commit: Commit | undefined
): ((event: React.MouseEvent | MouseEvent, index: number, item: FileEntry) => void) => {
  return useFileContextMenuT<FileEntry>(commit, itself);
};

export const useFileContextMenuT = <T,>(
  commit: Commit | undefined,
  getFile: (item: T) => FileEntry | undefined
): ((event: React.MouseEvent | MouseEvent, index: number, item: T) => void) => {
  const { show } = useContext(ContextMenuContext);
  const confirmDialog = useConfirmDialog();
  const fileCommands = useFileCommands();
  const {
    globalFileCommands,
    repositoryFileCommands,
    canExecuteFileCommand,
    getFileCommandWithContext,
    executeFileCommand
  } = useCustomCommands();

  const onFileContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, item: T) => {
      if (!commit) {
        return;
      }
      const file = getFile(item);
      if (!file) {
        return;
      }

      // Standard menu items
      const standardMenus = fileCommandsToActions(fileCommands, commit, file);

      // Helper to create menu item from custom file command
      const createCustomFileMenuItem = (
        command: FileCustomCommand,
        source: "Global" | "Repository"
      ): ActionItem => ({
        id: `custom-file-${source.toLowerCase()}-${command.name}`,
        label: `${command.description || command.name} (${source})`,
        disabled: !canExecuteFileCommand(command, file.path),
        handler: async () => {
          // Show confirmation dialog if required
          if (command.confirmBeforeExecute) {
            const result = getFileCommandWithContext(command, file.path, commit);
            if (result.error) {
              console.error("Cannot execute command:", result.error);
              return;
            }

            const confirmResult = await confirmDialog.showModal({
              title: "Execute Custom Command",
              content: <ConfirmContent commandLine={result.commandLine} />
            });
            if (confirmResult !== "accepted") {
              return;
            }
          }

          void executeFileCommand(command, file.path, commit).catch((error) => {
            console.error("Failed to execute custom file command:", error);
          });
        }
      });

      // Custom file command menu items
      const globalMenus: ActionItem[] = globalFileCommands
        .filter((cmd) => canExecuteFileCommand(cmd, file.path))
        .map((cmd) => createCustomFileMenuItem(cmd, "Global"));
      const repoMenus: ActionItem[] = repositoryFileCommands
        .filter((cmd) => canExecuteFileCommand(cmd, file.path))
        .map((cmd) => createCustomFileMenuItem(cmd, "Repository"));
      const customMenus: ActionItem[] = [...globalMenus, ...repoMenus];

      // Combine standard menus and custom menus with separator
      const menus: ("divider" | ActionItem)[] =
        customMenus.length > 0 ? [...standardMenus, "divider", ...customMenus] : standardMenus;

      show(event, menus);
    },
    [
      commit,
      show,
      confirmDialog,
      getFile,
      fileCommands,
      globalFileCommands,
      repositoryFileCommands,
      canExecuteFileCommand,
      getFileCommandWithContext,
      executeFileCommand
    ]
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
