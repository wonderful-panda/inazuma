import { useTheme } from "@mui/material";
import { useCallback, useMemo } from "react";
import { executeFileCommand } from "@/commands";
import type { FileCommand } from "@/commands/types";
import type { TreeItemVM } from "@/hooks/useTreeModel";
import { shrinkTreeInplace, sortTreeInplace, type TreeItem } from "@/tree";
import { assertNever, getFolderAndFileName } from "@/util";
import { VirtualTree } from "../VirtualTree";
import { FileListFolderRow, FileListRow } from "./FileListRow";

export type FileListViewType = "flat" | "folder";

type File = { type: "file"; file: FileEntry };
type Folder = { type: "folder"; name: string; path: string };
type RowData = File | Folder;

export interface FileListProps {
  viewType?: FileListViewType;
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

const getItemKey = (item: RowData) =>
  item.type === "file" ? `1:${item.file.path}` : `0:${item.path}`;

const buildFlatTree = (files: FileEntry[]): TreeItem<RowData>[] => {
  return files.map((file) => ({ data: { type: "file", file } }));
};

const buildFolderTree = (files: FileEntry[]): TreeItem<RowData>[] => {
  const root = {
    data: { type: "folder", name: "", path: "" },
    children: [] as TreeItem<RowData>[]
  } satisfies TreeItem<RowData>;
  const folders = new Map<string, Required<TreeItem<RowData>>>();
  folders.set("", root);
  const getFolder = (path: string): Required<TreeItem<RowData>> => {
    let folder = folders.get(path);
    if (folder !== undefined) {
      return folder;
    }
    const [parent, name] = getFolderAndFileName(path);
    folder = { data: { type: "folder", name, path }, children: [] };
    folders.set(path, folder);
    getFolder(parent).children.push(folder);
    return folder;
  };
  files.forEach((file) => {
    const item: TreeItem<File> = { data: { type: "file", file } };
    const [parent] = getFolderAndFileName(file.path);
    getFolder(parent).children.push(item);
  });

  shrinkTreeInplace(root.children, (parent, child) => {
    if (parent.data.type === "file" || child.data.type === "file") {
      return parent;
    } else {
      return {
        data: { ...child.data, name: `${parent.data.name}/${child.data.name}` },
        children: child.children
      };
    }
  });

  sortTreeInplace(root.children, (a, b) => getItemKey(a.data).localeCompare(getItemKey(b.data)));
  return root.children;
};

const useNativeRowEventHandler = <E,>(
  handler?: (event: E, index: number, item: FileEntry) => void
) =>
  useMemo(() => {
    if (handler === undefined) {
      return undefined;
    }
    return (event: E, index: number, item: TreeItemVM<RowData>) => {
      if (item.item.data.type !== "file") {
        return;
      }
      handler(event, index, item.item.data.file);
    };
  }, [handler]);

export const FileList: React.FC<FileListProps> = ({
  viewType = "flat",
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
  const folderRowHeight = rowHeight * 0.75;
  const itemSize = useCallback(
    (item: RowData) => (item.type === "file" ? rowHeight : folderRowHeight),
    [rowHeight, folderRowHeight]
  );
  const rootItems = useMemo(() => {
    switch (viewType) {
      case "flat":
        return buildFlatTree(files);
      case "folder":
        return buildFolderTree(files);
      default:
        return assertNever(viewType);
    }
  }, [files, viewType]);

  const handleRowClick = useNativeRowEventHandler(onRowClick);
  const handleRowDoubleClick = useNativeRowEventHandler(onRowDoubleClick);
  const handleRowDragEnter = useNativeRowEventHandler(onRowDragEnter);
  const handleRowDragLeave = useNativeRowEventHandler(onRowDragLeave);
  const handleRowDragOver = useNativeRowEventHandler(onRowDragOver);
  const handleRowDrop = useNativeRowEventHandler(onRowDrop);
  const handleRowContextMenu = useNativeRowEventHandler(onRowContextMenu);

  const renderRow = useCallback(
    (item: TreeItem<RowData>, index: number) => {
      return item.data.type === "file" ? (
        <FileListRow
          commit={commit}
          file={item.data.file}
          index={index}
          height={rowHeight}
          actionCommands={actionCommands}
        />
      ) : (
        <FileListFolderRow
          icon="octicon:file-directory-fill-16"
          index={index}
          height={folderRowHeight}
          text={item.data.name}
        />
      );
    },
    [rowHeight, folderRowHeight, commit, actionCommands]
  );
  const handleSelectionChange = useMemo(() => {
    if (onSelectionChange === undefined) {
      return undefined;
    } else {
      return (index: number, item: TreeItem<RowData> | undefined) =>
        onSelectionChange(index, item?.data.type === "file" ? item.data.file : undefined);
    }
  }, [onSelectionChange]);

  return (
    <VirtualTree<RowData>
      rootItems={rootItems}
      getItemKey={getItemKey}
      itemSize={itemSize}
      expandAllOnMounted
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
