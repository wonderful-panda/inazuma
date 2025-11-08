import { useTheme } from "@mui/material";
import { useCallback } from "react";
import { executeFileCommand } from "@/commands";
import type { FileCommand } from "@/commands/types";
import { VirtualList, type VirtualListEvents, type VirtualListMethods } from "../VirtualList";
import { FileListRow } from "./FileListRow";

export interface FileListProps extends VirtualListEvents<FileEntry> {
  commit: Commit;
  files: FileEntry[];
  actionCommands?: readonly FileCommand[];
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

export const FileList: React.FC<FileListProps & { ref?: React.Ref<VirtualListMethods> }> = ({
  commit,
  files,
  actionCommands,
  ref,
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
  return (
    <VirtualList<FileEntry>
      ref={ref}
      items={files}
      itemSize={rowHeight}
      getItemKey={getFileListKey}
      {...rest}
    >
      {renderRow}
    </VirtualList>
  );
};
