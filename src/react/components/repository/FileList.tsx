import { useTheme } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";
import { executeFileCommand } from "@/commands";
import type { FileCommand } from "@/commands/types";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { useItemBasedListItemSelector } from "@/hooks/useItemBasedListItemSelector";
import { useListIndexChanger } from "@/hooks/useListIndexChanger";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { VirtualList, type VirtualListEvents, type VirtualListMethods } from "../VirtualList";
import { FileListRow } from "./FileListRow";

export interface FileListProps extends Omit<VirtualListEvents<FileEntry>, "onRowMouseDown"> {
  commit: Commit;
  files: FileEntry[];
  actionCommands?: readonly FileCommand[];
  onSelectionChange?: (index: number) => void;
}

const getFileListKey = (item: FileEntry) => `${item.path}:${item.statusCode}`;

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

export const FileList: React.FC<FileListProps> = ({
  commit,
  files,
  actionCommands,
  onSelectionChange,
  ...rest
}) => {
  const theme = useTheme();
  const rowHeight = theme.custom.baseFontSize * 3;
  const renderRow = useCallback(
    ({ index, item }: { index: number; item: FileEntry }) => {
      return (
        <FileListRow
          commit={commit}
          file={item}
          index={index}
          height={rowHeight}
          actionCommands={actionCommands}
        />
      );
    },
    [rowHeight, commit, actionCommands]
  );
  const ref = useRef<VirtualListMethods>(null);
  const { selectedIndex, setSelectedIndex } = useItemBasedListItemSelector(files);
  const { handleKeyDown, handleRowMouseDown } = useListIndexChanger(
    files.length || 0,
    setSelectedIndex
  );
  useEffect(() => {
    ref.current?.scrollToItem(selectedIndex);
    onSelectionChange?.(selectedIndex);
  }, [selectedIndex, onSelectionChange]);

  return (
    <SelectedIndexProvider value={selectedIndex}>
      <KeyDownTrapper className="m-1 p-1" onKeyDown={handleKeyDown}>
        <VirtualList<FileEntry>
          ref={ref}
          items={files}
          itemSize={rowHeight}
          getItemKey={getFileListKey}
          onRowMouseDown={handleRowMouseDown}
          {...rest}
        >
          {renderRow}
        </VirtualList>
      </KeyDownTrapper>
    </SelectedIndexProvider>
  );
};
