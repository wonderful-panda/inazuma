import { useCallback } from "react";
import FileListRow, { ROW_HEIGHT } from "./FileListRow";
import VirtualList from "../VirtualList";

export interface FileListProps {
  files: FileEntry[];
  onRowClick?: (event: React.MouseEvent, index: number, file: FileEntry) => void;
  onRowDoubleClick?: (event: React.MouseEvent, index: number, file: FileEntry) => void;
}

const FileList: React.VFC<FileListProps> = ({ files, onRowClick, onRowDoubleClick }) => {
  const getItemKey = useCallback((item: FileEntry) => `${item.path}:${item.statusCode}`, []);
  const renderRow = useCallback(({ index, item }: { index: number; item: FileEntry }) => {
    return <FileListRow file={item} index={index} />;
  }, []);
  return (
    <VirtualList<FileEntry>
      items={files}
      itemSize={ROW_HEIGHT}
      getItemKey={getItemKey}
      onRowClick={onRowClick}
      onRowDoubleClick={onRowDoubleClick}
    >
      {renderRow}
    </VirtualList>
  );
};

export default FileList;
