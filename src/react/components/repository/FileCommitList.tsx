import { useCallback } from "react";
import FileCommitListRow, { getRowHeight } from "./FileCommitListRow";
import VirtualList from "../VirtualList";

export interface FileCommitListProps {
  commits: readonly FileCommit[];
  refs: Refs | undefined;
  onRowClick?: (event: React.MouseEvent, index: number, commit: FileCommit) => void;
}

const FileCommitList: React.VFC<FileCommitListProps> = ({ commits, refs, onRowClick }) => {
  const renderRow = useCallback(
    ({ index, item }: { index: number; item: FileCommit }) => (
      <FileCommitListRow
        commit={item}
        index={index}
        head={item.id === refs?.head}
        refs={refs?.refsById[item.id] || []}
      />
    ),
    [commits, refs]
  );
  const getItemKey = useCallback((item: FileCommit) => item.id, []);
  const rowHeight = useCallback(
    (index: number) => {
      return getRowHeight(commits[index]);
    },
    [commits]
  );
  return (
    <VirtualList<FileCommit>
      items={commits}
      itemSize={rowHeight}
      getItemKey={getItemKey}
      onRowClick={onRowClick}
    >
      {renderRow}
    </VirtualList>
  );
};

export default FileCommitList;
