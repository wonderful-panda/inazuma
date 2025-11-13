import { useTheme } from "@mui/material";
import { useCallback, useMemo } from "react";
import { executeFileCommand } from "@/commands";
import type { FileCommand } from "@/commands/types";
import type { TreeItemVM } from "@/hooks/useTreeModel";
import type { TreeItem } from "@/tree";
import { VirtualTree } from "../VirtualTree";
import { FileListRow } from "./FileListRow";

export interface FileListProps {
  commit: Commit;
  files: FileEntry[];
  actionCommands?: readonly FileCommand[];
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onSelectionChange?: (index: number, item: FileEntry | undefined) => void;
  onRowClick?: (event: React.MouseEvent, index: number, item: FileEntry) => void;
  onRowDoubleClick?: (event: React.MouseEvent, index: number, item: FileEntry) => void;
  onRowContextMenu?: (event: React.MouseEvent, index: number, item: FileEntry) => void;
  onRowDragEnter?: (event: React.DragEvent, index: number, item: FileEntry) => void;
  onRowDragLeave?: (event: React.DragEvent, index: number, item: FileEntry) => void;
  onRowDragOver?: (event: React.DragEvent, index: number, item: FileEntry) => void;
  onRowDrop?: (event: React.DragEvent, index: number, item: FileEntry) => void;
}

export const useFileListRowEventHandler = (command: FileCommand, commit: Commit | undefined) => {
  return useCallback(
    (_e: unknown, _index: number, item: FileEntry) => {
      if (!commit) {
        return;
      }
      executeFileCommand(command, commit, item);
    },
    [commit, command]
  );
};

const getItemKey = (item: FileEntry) => item.path;

const useNativeRowEventHandler = <E,>(
  handler?: (event: E, index: number, item: FileEntry) => void
) =>
  useMemo(() => {
    if (handler === undefined) {
      return undefined;
    }
    return (event: E, index: number, item: TreeItemVM<FileEntry>) => {
      const file = item.item.data;
      handler(event, index, file);
    };
  }, [handler]);

export const FileList: React.FC<FileListProps> = ({
  commit,
  files,
  actionCommands,
  onKeyDown,
  onSelectionChange,
  onRowClick,
  onRowDoubleClick,
  onRowDragEnter,
  onRowDragLeave,
  onRowDragOver,
  onRowDrop,
  onRowContextMenu
}) => {
  const theme = useTheme();
  const rowHeight = theme.custom.baseFontSize * 3;
  const rootItems = useMemo(() => files.map((data) => ({ data })), [files]);

  const handleRowClick = useNativeRowEventHandler(onRowClick);
  const handleRowDoubleClick = useNativeRowEventHandler(onRowDoubleClick);
  const handleRowDragEnter = useNativeRowEventHandler(onRowDragEnter);
  const handleRowDragLeave = useNativeRowEventHandler(onRowDragLeave);
  const handleRowDragOver = useNativeRowEventHandler(onRowDragOver);
  const handleRowDrop = useNativeRowEventHandler(onRowDrop);
  const handleRowContextMenu = useNativeRowEventHandler(onRowContextMenu);

  const renderRow = useCallback(
    (item: TreeItem<FileEntry>, index: number) => {
      return (
        <FileListRow
          commit={commit}
          file={item.data}
          index={index}
          height={rowHeight}
          actionCommands={actionCommands}
        />
      );
    },
    [rowHeight, commit, actionCommands]
  );
  const handleSelectionChange = useMemo(() => {
    if (onSelectionChange === undefined) {
      return undefined;
    } else {
      return (index: number, item: TreeItem<FileEntry> | undefined) =>
        onSelectionChange(index, item?.data);
    }
  }, [onSelectionChange]);

  return (
    <VirtualTree<FileEntry>
      rootItems={rootItems}
      getItemKey={getItemKey}
      itemSize={rowHeight}
      renderRow={renderRow}
      onKeyDown={onKeyDown}
      onSelectionChange={handleSelectionChange}
      onRowClick={handleRowClick}
      onRowDoubleClick={handleRowDoubleClick}
      onRowDragEnter={handleRowDragEnter}
      onRowDragLeave={handleRowDragLeave}
      onRowDragOver={handleRowDragOver}
      onRowDrop={handleRowDrop}
      onRowContextMenu={handleRowContextMenu}
    />
  );
};
