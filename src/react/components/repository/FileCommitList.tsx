import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import { useCallback } from "react";
import FileCommitListRow, { getRowHeight } from "./FileCommitListRow";

export interface FileCommitListProps {
  commits: readonly FileCommit[];
  refs: Refs;
  selectedIndex: number;
  onRowclick?: (event: React.MouseEvent, index: number, commit: FileCommit) => void;
}

const FileCommitList: React.VFC<FileCommitListProps> = ({
  commits,
  refs,
  selectedIndex,
  onRowclick
}) => {
  const renderRow = useCallback(
    ({ index, style }: { index: number; style: object }) => {
      const commit = commits[index];
      const handleClick = onRowclick && ((e: React.MouseEvent) => onRowclick(e, index, commit));
      return (
        <div key={commit.id} style={style}>
          <FileCommitListRow
            commit={commit}
            selected={index === selectedIndex}
            head={commit.id === refs.head}
            refs={refs.refsById[commit.id]}
            onClick={handleClick}
          />
        </div>
      );
    },
    [commits, refs, selectedIndex, onRowclick]
  );
  const rowHeight = useCallback(
    (index: number) => {
      return getRowHeight(commits[index]);
    },
    [commits]
  );

  return (
    <AutoSizer className="flex flex-1">
      {({ width, height }) => (
        <VariableSizeList
          className="flex-1"
          width={width}
          height={height}
          overscanCount={8}
          itemCount={commits.length}
          itemSize={rowHeight}
        >
          {renderRow}
        </VariableSizeList>
      )}
    </AutoSizer>
  );
};

export default FileCommitList;
