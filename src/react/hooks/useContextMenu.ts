import {
  commitCommands,
  commitCommandsToActions,
  fileCommands,
  fileCommandsToActions
} from "@/commands";
import { ContextMenuContext } from "@/context/ContextMenuContext";
import { useDispatch } from "@/store";
import { useCallback, useContext } from "react";

export const useCommitContextMenu = (): ((
  event: React.MouseEvent | MouseEvent,
  index: number,
  item: Commit
) => void) => {
  const dispatch = useDispatch();
  const { show } = useContext(ContextMenuContext);
  const onCommitContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, commit: Commit) => {
      if (!commit) {
        return;
      }
      const menus = commitCommandsToActions(dispatch, commitCommands, commit);
      show(event, menus);
    },
    [show, dispatch]
  );
  return onCommitContextMenu;
};

export const useFileContextMenu = (
  commit: Commit | undefined
): ((event: React.MouseEvent | MouseEvent, index: number, item: FileEntry) => void) => {
  return useFileContextMenuT<FileEntry>(commit, (item) => item);
};

export const useFileContextMenuT = <T>(
  commit: Commit | undefined,
  getFile: (item: T) => FileEntry | undefined
): ((event: React.MouseEvent | MouseEvent, index: number, item: T) => void) => {
  const dispatch = useDispatch();
  const { show } = useContext(ContextMenuContext);
  const onFileContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, item: T) => {
      if (!commit) {
        return;
      }
      const file = getFile(item);
      if (!file) {
        return;
      }
      const menus = fileCommandsToActions(dispatch, fileCommands, commit, file);
      show(event, menus);
    },
    [commit, show, dispatch, getFile]
  );
  return onFileContextMenu;
};

export const useFileCommitContextMenu = (
  localPath: string
): ((event: React.MouseEvent | MouseEvent, index: number, item: FileCommit) => void) => {
  const dispatch = useDispatch();
  const { show } = useContext(ContextMenuContext);
  const onFileContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, item: FileCommit) => {
      const menus = [
        ...commitCommandsToActions(dispatch, commitCommands, item),
        ...fileCommandsToActions(dispatch, fileCommands, item, item, localPath)
      ];
      show(event, menus);
    },
    [show, localPath, dispatch]
  );
  return onFileContextMenu;
};
