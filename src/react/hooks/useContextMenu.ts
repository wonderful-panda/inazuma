import {
  commitCommands,
  commitCommandsToActions,
  fileCommands,
  fileCommandsToActions
} from "@/commands";
import { ContextMenuContext } from "@/context/ContextMenuContext";
import { useDispatch } from "@/store";
import React, { useCallback, useContext } from "react";

export const useCommitContextMenu = (): ((
  event: React.MouseEvent | MouseEvent,
  index: number,
  item: DagNode
) => void) => {
  const dispatch = useDispatch();
  const { show } = useContext(ContextMenuContext);
  const onCommitContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, commit: DagNode) => {
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
  commit: DagNode | undefined
): ((event: React.MouseEvent | MouseEvent, index: number, item: FileEntry) => void) => {
  const dispatch = useDispatch();
  const { show } = useContext(ContextMenuContext);
  const onFileContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, _index: number, item: FileEntry) => {
      if (!commit) {
        return;
      }
      const menus = fileCommandsToActions(dispatch, fileCommands, commit, item);
      show(event, menus);
    },
    [commit, show, dispatch]
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
