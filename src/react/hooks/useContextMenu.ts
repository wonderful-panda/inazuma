import { executeFileCommand, fileCommands } from "@/commands";
import { ContextMenuContext, ContextMenuItem } from "@/context/ContextMenuContext";
import { useDispatch } from "@/store";
import { useCallback, useContext } from "react";

export const useFileContextMenu = (
  commit: DagNode | undefined
): ((event: React.MouseEvent, index: number, item: FileEntry) => void) => {
  const dispatch = useDispatch();
  const { show } = useContext(ContextMenuContext);
  const onFileContextMenu = useCallback(
    (event: React.MouseEvent, _index: number, item: FileEntry) => {
      if (!commit) {
        return;
      }
      const menus: ContextMenuItem[] = fileCommands
        .filter((c) => !c.hidden?.(commit, item, item.path))
        .map((c) => {
          const { id, label, icon } = c;
          const disabled = c.disabled?.(commit, item, item.path);
          const handler = () => executeFileCommand(c, dispatch, commit, item);
          return { id, label, icon, disabled, handler };
        });

      show(event, menus);
    },
    [commit, show, dispatch]
  );
  return onFileContextMenu;
};
