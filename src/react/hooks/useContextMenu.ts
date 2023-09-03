import {
  useCommitCommands,
  commitCommandsToActions,
  fileCommandsToActions,
  useFileCommands
} from "@/commands";
import { ContextMenuContext } from "@/context/ContextMenuContext";
import { useCallback, useContext } from "react";

export const useCommitContextMenu = (): ((
  event: React.MouseEvent | MouseEvent,
  index: number,
  item: Commit
) => void) => {
  const { show } = useContext(ContextMenuContext);
  const commitCommands = useCommitCommands();
  const onCommitContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, commit: Commit) => {
      if (!commit) {
        return;
      }
      const menus = commitCommandsToActions(commitCommands, commit);
      show(event, menus);
    },
    [show, commitCommands]
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
