import { forwardRef, useCallback } from "react";
import FileListRow, { ROW_HEIGHT } from "./FileListRow";
import VirtualList, { VirtualListEvents, VirtualListMethods } from "../VirtualList";

export interface FileListProps extends VirtualListEvents<FileEntry> {
  files: FileEntry[];
}

const FileList = forwardRef<VirtualListMethods, FileListProps>(({ files, ...rest }, ref) => {
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
});

export default FileList;
