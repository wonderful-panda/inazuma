import { IconButton, ToggleButton, ToggleButtonGroup, useTheme } from "@mui/material";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { executeFileCommand } from "@/commands";
import type { FileCommand } from "@/commands/types";
import { type FileStatus, FileStatusList } from "@/filestatus";
import type { TreeItemVM, TreeModelDispatch } from "@/hooks/useTreeModel";
import { filterTreeItems, shrinkTreeInplace, sortTreeInplace, type TreeItem } from "@/tree";
import { assertNever, getFolderAndFileName, nope } from "@/util";
import { Icon } from "../Icon";
import { VirtualTree } from "../VirtualTree";
import { FileListFolderRow, FileListRow, FileListStatusRow } from "./FileListRow";
import PathFilter from "./PathFilter";

const viewTypeValues = ["flat", "folder", "status"] as const;
export type FileListViewType = (typeof viewTypeValues)[number];

export const fixView = (value: string) => viewTypeValues.find((v) => v === value) || "flat";

type File = FileEntry;
type Folder = { type: "folder"; name: string; path: string };
type StatusHeader = { type: "status"; status: FileStatus };
type RowData = File | Folder | StatusHeader;

function isFile(value: RowData): value is File {
  return !("type" in value);
}
function isStatusHeader(value: RowData): value is StatusHeader {
  return "type" in value && value.type === "status";
}
function isFolder(value: RowData): value is Folder {
  return "type" in value && value.type === "folder";
}

export interface FileListProps {
  view?: FileListViewType;
  onViewChange?: (value: FileListViewType) => void;
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
  isStatusHeader(item) ? `0:${item.status}` : `${isFolder(item) ? 1 : 2}:${item.path}`;

const buildFlatTree = (files: FileEntry[]): TreeItem<RowData>[] => {
  return files.map((data) => ({ data }));
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
    const item: TreeItem<File> = { data: file };
    const [parent] = getFolderAndFileName(file.path);
    getFolder(parent).children.push(item);
  });

  shrinkTreeInplace(root.children, (parent, child) => {
    if (isFolder(parent.data) && isFolder(child.data)) {
      return {
        data: { ...child.data, name: `${parent.data.name}/${child.data.name}` },
        children: child.children
      };
    } else {
      return parent;
    }
  });

  sortTreeInplace(root.children, (a, b) => getItemKey(a.data).localeCompare(getItemKey(b.data)));
  return root.children;
};

const buildStatusTree = (files: FileEntry[]): TreeItem<RowData>[] => {
  const rootItems = FileStatusList.map((status) => ({
    data: { type: "status", status },
    children: [] as TreeItem<RowData>[]
  })) satisfies TreeItem<RowData>[];
  const unknownItems: TreeItem<RowData>[] = [];
  const rootItemMap = new Map<string, (typeof rootItems)[number]>(
    rootItems.map((item) => [item.data.status, item])
  );
  files.forEach((data) => {
    const item = { data } satisfies TreeItem<RowData>;
    const root = rootItemMap.get(data.statusCode.substring(0, 1));
    if (root !== undefined) {
      root.children.push(item);
    } else {
      unknownItems.push(item);
    }
  });
  return [...rootItems.filter((item) => item.children.length > 0), ...unknownItems];
};

const useNativeRowEventHandler = <E,>(
  handler?: (event: E, index: number, item: FileEntry) => void
) =>
  useMemo(() => {
    if (handler === undefined) {
      return undefined;
    }
    return (event: E, index: number, item: TreeItemVM<RowData>) => {
      if (!isFile(item.item.data)) {
        return;
      }
      handler(event, index, item.item.data);
    };
  }, [handler]);

interface FileListFilterBarProps {
  view: FileListViewType;
  onViewChange: (view: FileListViewType) => void;
  onFilterTextChange: (text: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

const FileListFilterBar: React.FC<FileListFilterBarProps> = ({
  view,
  onViewChange,
  onFilterTextChange,
  expandAll,
  collapseAll
}) => {
  const handleViewChange = useCallback(
    (_e: unknown, value: string) => {
      const view = fixView(value);
      onViewChange(view);
    },
    [onViewChange]
  );
  return (
    <div className="flex-row-nowrap items-end">
      <PathFilter onFilterTextChange={onFilterTextChange} className="flex-1" />
      <div className="flex-row-nowrap">
        <ToggleButtonGroup
          value={view}
          exclusive
          size="small"
          className="mx-2"
          onChange={handleViewChange}
        >
          <ToggleButton value="flat" title="Flat view">
            <Icon icon="mdi:format-list-bulleted" className="text-xl" />
          </ToggleButton>
          <ToggleButton value="folder" title="Folder view">
            <Icon icon="mdi:file-tree" className="text-xl" />
          </ToggleButton>
          <ToggleButton value="status" title="Status view">
            <Icon icon="octicon:diff-modified-16" className="text-xl" />
          </ToggleButton>
        </ToggleButtonGroup>
        <IconButton
          size="small"
          title="Expand all"
          className="my-auto"
          disabled={view === "flat"}
          onClick={expandAll}
        >
          <Icon icon="mdi:chevron-down" className="text-xl" />
        </IconButton>
        <IconButton
          size="small"
          title="Collapse all"
          className="my-auto"
          disabled={view === "flat"}
          onClick={collapseAll}
        >
          <Icon icon="mdi:chevron-up" className="text-xl" />
        </IconButton>
      </div>
    </div>
  );
};

export const FileList: React.FC<FileListProps> = ({
  view = "flat",
  commit,
  files,
  actionCommands,
  onViewChange,
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
  const dispatchRef = useRef<TreeModelDispatch<RowData> | null>(null);

  const [filterText, setFilterText] = useState("");
  const theme = useTheme();
  const rowHeight = theme.custom.baseFontSize * 3;
  const headerRowHeight = rowHeight * 0.75;
  const itemSize = useCallback(
    (item: RowData) => (isFile(item) ? rowHeight : headerRowHeight),
    [rowHeight, headerRowHeight]
  );
  const rootItems = useMemo(() => {
    switch (view) {
      case "flat":
        return buildFlatTree(files);
      case "folder":
        return buildFolderTree(files);
      case "status":
        return buildStatusTree(files);
      default:
        return assertNever(view);
    }
  }, [files, view]);

  const visibleItems = useMemo(() => {
    return filterTreeItems(
      rootItems,
      (item) => !isStatusHeader(item) && item.path.includes(filterText)
    );
  }, [rootItems, filterText]);

  useLayoutEffect(() => {
    // expand all nodes after view changed
    void view;
    dispatchRef.current?.({ type: "expandAll" });
  }, [view]);

  const handleRowClick = useNativeRowEventHandler(onRowClick);
  const handleRowDoubleClick = useNativeRowEventHandler(onRowDoubleClick);
  const handleRowDragEnter = useNativeRowEventHandler(onRowDragEnter);
  const handleRowDragLeave = useNativeRowEventHandler(onRowDragLeave);
  const handleRowDragOver = useNativeRowEventHandler(onRowDragOver);
  const handleRowDrop = useNativeRowEventHandler(onRowDrop);
  const handleRowContextMenu = useNativeRowEventHandler(onRowContextMenu);

  const expandAll = useCallback(() => dispatchRef.current?.({ type: "expandAll" }), []);
  const collapseAll = useCallback(() => dispatchRef.current?.({ type: "collapseAll" }), []);

  const renderRow = useCallback(
    (item: TreeItem<RowData>, index: number) => {
      if (isFile(item.data)) {
        return (
          <FileListRow
            commit={commit}
            file={item.data}
            index={index}
            height={rowHeight}
            actionCommands={actionCommands}
            showFullPath={view !== "folder"}
          />
        );
      } else if (isFolder(item.data)) {
        return (
          <FileListFolderRow
            icon="octicon:file-directory-fill-16"
            index={index}
            height={headerRowHeight}
            text={item.data.name}
          />
        );
      } else {
        return (
          <FileListStatusRow index={index} height={headerRowHeight} status={item.data.status} />
        );
      }
    },
    [rowHeight, headerRowHeight, commit, actionCommands, view]
  );
  const handleSelectionChange = useMemo(() => {
    if (onSelectionChange === undefined) {
      return undefined;
    } else {
      return (index: number, item: TreeItem<RowData> | undefined) =>
        onSelectionChange(index, item !== undefined && isFile(item.data) ? item.data : undefined);
    }
  }, [onSelectionChange]);

  return (
    <div className="flex-1 grid grid-rows-[max-content_1fr] gap-2">
      <FileListFilterBar
        view={view}
        onFilterTextChange={setFilterText}
        onViewChange={onViewChange || nope}
        expandAll={expandAll}
        collapseAll={collapseAll}
      />
      <VirtualTree<RowData>
        dispatchRef={dispatchRef}
        rootItems={visibleItems}
        getItemKey={getItemKey}
        itemSize={itemSize}
        defaultNodeState="expanded"
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
    </div>
  );
};
