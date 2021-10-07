import { AutoSizer, Index, List } from "react-virtualized";
import { useCallback, useEffect, useState } from "react";
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
  const [scrollToIndex, setScrollToIndex] = useState<number | undefined>(undefined);
  useEffect(() => {
    setScrollToIndex(selectedIndex);
    setTimeout(() => {
      setScrollToIndex(undefined);
    }, 0);
  }, [selectedIndex]);
  const renderRow = useCallback(
    ({ index, key, style }: { index: number; key: string; style: object }) => {
      const commit = commits[index];
      const handleClick = onRowclick && ((e: React.MouseEvent) => onRowclick(e, index, commit));
      return (
        <div key={key} style={style}>
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
    ({ index }: Index) => {
      return getRowHeight(commits[index]);
    },
    [commits]
  );

  return (
    <AutoSizer className="flex flex-1">
      {({ width, height }) => (
        <List
          className="flex-1"
          width={width}
          height={height}
          overscanRowCount={8}
          scrollToIndex={scrollToIndex}
          rowCount={commits.length}
          rowHeight={rowHeight}
          rowRenderer={renderRow}
        />
      )}
    </AutoSizer>
  );
};

export default FileCommitList;
