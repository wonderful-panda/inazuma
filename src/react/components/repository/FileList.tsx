import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
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
    ({ index, style }: { index: number; style: object }) => {
      const file = files[index];
      return (
        <div
          data-index={index}
          key={`${file.path}:${file.statusCode}`}
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
        <FixedSizeList
          width={width}
          height={height}
          overscanCount={8}
          itemCount={files.length}
          itemSize={ROW_HEIGHT}
        >
          {renderRow}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
};

export default FileList;
