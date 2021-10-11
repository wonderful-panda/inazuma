import { Dispatch, SetStateAction, useCallback } from "react";
import FileListRow, { ROW_HEIGHT } from "./FileListRow";
import VirtualList from "../VirtualList";

export interface FileListProps {
  files: FileEntry[];
  selectedIndex: number;
  onUpdateSelectedIndex: Dispatch<SetStateAction<number>>;
  onRowClick?: (event: React.MouseEvent, index: number, file: FileEntry) => void;
  onRowDoubleClick?: (event: React.MouseEvent, index: number, file: FileEntry) => void;
}

const FileList: React.VFC<FileListProps> = ({
  files,
  selectedIndex,
  onUpdateSelectedIndex,
  onRowClick,
  onRowDoubleClick
}) => {
  const getItemKey = useCallback((item: FileEntry) => `${item.path}:${item.statusCode}`, []);
  const renderRow = useCallback(
    ({ index, selectedIndex, item }: { index: number; selectedIndex: number; item: FileEntry }) => {
      return <FileListRow file={item} selected={index === selectedIndex} />;
    },
    []
  );
  return (
    <VirtualList<FileEntry>
      items={files}
      itemSize={ROW_HEIGHT}
      getItemKey={getItemKey}
      selectedIndex={selectedIndex}
      onUpdateSelectedIndex={onUpdateSelectedIndex}
      onRowClick={onRowClick}
      onRowDoubleClick={onRowDoubleClick}
    >
      {renderRow}
    </VirtualList>
  );
};

export default FileList;
