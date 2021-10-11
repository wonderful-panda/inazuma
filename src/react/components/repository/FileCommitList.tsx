import { Dispatch, SetStateAction, useCallback } from "react";
import FileCommitListRow, { getRowHeight } from "./FileCommitListRow";
import VirtualList from "../VirtualList";

export interface FileCommitListProps {
  commits: readonly FileCommit[];
  refs: Refs;
  selectedIndex: number;
  onUpdateSelectedIndex: Dispatch<SetStateAction<number>>;
  onRowClick?: (event: React.MouseEvent, index: number, commit: FileCommit) => void;
}

const FileCommitList: React.VFC<FileCommitListProps> = ({
  commits,
  refs,
  selectedIndex,
  onUpdateSelectedIndex,
  onRowClick
}) => {
  const renderRow = useCallback(
    (p: { index: number; selectedIndex: number; item: FileCommit }) => (
      <FileCommitListRow
        commit={p.item}
        selected={p.index === p.selectedIndex}
        head={p.item.id === refs.head}
        refs={refs.refsById[p.item.id]}
      />
    ),
    [commits, refs, selectedIndex]
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
      selectedIndex={selectedIndex}
      onUpdateSelectedIndex={onUpdateSelectedIndex}
      onRowClick={onRowClick}
    >
      {renderRow}
    </VirtualList>
  );
};

export default FileCommitList;
