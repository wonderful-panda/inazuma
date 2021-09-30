import { AutoSizer, List } from "react-virtualized";
import { useCallback } from "react";
import FileListRow, { ROW_HEIGHT } from "./FileListRow";

export interface FileListProps {
  files: FileEntry[];
  onRowclick?: (event: React.MouseEvent, index: number, file: FileEntry) => void;
}

const FileList: React.VFC<FileListProps> = ({ files, onRowclick }) => {
  const renderRow = useCallback(
    ({ index, key, style }: { index: number; key: string; style: object }) => {
      const file = files[index];
      const handleClick = onRowclick && ((e: React.MouseEvent) => onRowclick(e, index, file));
      return (
        <div key={key} style={style}>
          <FileListRow file={file} selected={false} onClick={handleClick} />
        </div>
      );
    },
    [files, onRowclick]
  );
  return (
    <AutoSizer style={{ flex: 1 }}>
      {({ width, height }) => (
        <List
          width={width}
          height={height}
          overscanRowCount={8}
          rowCount={files.length}
          rowHeight={ROW_HEIGHT}
          rowRenderer={renderRow}
        />
      )}
    </AutoSizer>
  );
};

export default FileList;
