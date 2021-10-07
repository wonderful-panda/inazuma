import { AutoSizer, List } from "react-virtualized";
import { useCallback, useMemo } from "react";
import FileListRow, { ROW_HEIGHT } from "./FileListRow";

export interface FileListProps {
  files: FileEntry[];
  onRowClick?: (event: React.MouseEvent, index: number, file: FileEntry) => void;
  onRowDoubleClick?: (event: React.MouseEvent, index: number, file: FileEntry) => void;
}

function createRowEventHandler(
  files: readonly FileEntry[],
  handler?: (event: React.MouseEvent, index: number, file: FileEntry) => void
) {
  return useMemo(() => {
    if (!handler) {
      return undefined;
    }
    return (event: React.MouseEvent) => {
      const index = parseInt((event.currentTarget as HTMLElement).dataset.index || "-1");
      if (0 <= index) {
        const file = files[index];
        handler(event, index, file);
      }
    };
  }, [files, handler]);
}

const FileList: React.VFC<FileListProps> = ({ files, onRowClick, onRowDoubleClick }) => {
  const handleRowClick = createRowEventHandler(files, onRowClick);
  const handleRowDoubleClick = createRowEventHandler(files, onRowDoubleClick);
  const renderRow = useCallback(
    ({ index, key, style }: { index: number; key: string; style: object }) => {
      const file = files[index];
      return (
        <div
          data-index={index}
          key={key}
          style={style}
          onClick={handleRowClick}
          onDoubleClick={handleRowDoubleClick}
        >
          <FileListRow file={file} selected={false} />
        </div>
      );
    },
    [files]
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
