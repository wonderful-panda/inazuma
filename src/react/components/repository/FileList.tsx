import { forwardRef, ForwardRefRenderFunction, useCallback } from "react";
import FileListRow, { ROW_HEIGHT } from "./FileListRow";
import VirtualList, { VirtualListEvents, VirtualListMethods } from "../VirtualList";
import { FileCommand } from "@/commands/types";
import { useDispatch } from "@/store";
import { executeFileCommand } from "@/commands";

export interface FileListProps extends VirtualListEvents<FileEntry> {
  files: FileEntry[];
}

export const useFileListRowEventHandler = (command: FileCommand, commit: DagNode | undefined) => {
  const dispatch = useDispatch();
  return useCallback(
    (_e: unknown, _index: number, item: FileEntry) => {
      if (!commit) {
        return;
      }
      executeFileCommand(command, dispatch, commit, item);
    },
    [commit, command]
  );
};

const FileList: ForwardRefRenderFunction<VirtualListMethods, FileListProps> = (
  { files, ...rest },
  ref
) => {
  const getItemKey = useCallback((item: FileEntry) => `${item.path}:${item.statusCode}`, []);
  const renderRow = useCallback(({ index, item }: { index: number; item: FileEntry }) => {
    return <FileListRow file={item} index={index} />;
  }, []);
  return (
    <VirtualList<FileEntry>
      ref={ref}
      items={files}
      itemSize={ROW_HEIGHT}
      getItemKey={getItemKey}
      {...rest}
    >
      {renderRow}
    </VirtualList>
  );
};

export default forwardRef(FileList);
