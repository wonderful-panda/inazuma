import { forwardRef, useCallback } from "react";
import FileCommitListRow from "./FileCommitListRow";
import VirtualList, { VirtualListMethods } from "../VirtualList";

export interface FileCommitListProps {
  commits: readonly FileCommit[];
  refs: Refs | undefined;
  fontSize: FontSize;
  onRowClick?: (event: React.MouseEvent, index: number, commit: FileCommit) => void;
}

export const getRowHeight = (commit: FileCommit, fileSize: FontSize) => {
  if (fileSize === "medium") {
    return commit.oldPath ? 76 : 52;
  } else {
    return commit.oldPath ? 64 : 44;
  }
};

const FileCommitList: React.ForwardRefRenderFunction<VirtualListMethods, FileCommitListProps> = (
  { commits, refs, fontSize, onRowClick },
  ref
) => {
  console.log("FileCommitList", fontSize);
  const renderRow = useCallback(
    ({ index, item }: { index: number; item: FileCommit }) => (
      <FileCommitListRow
        commit={item}
        index={index}
        head={item.id === refs?.head}
        refs={refs?.refsById[item.id] || []}
        height={getRowHeight(item, fontSize)}
      />
    ),
    [refs, fontSize]
  );
  const getItemKey = useCallback((item: FileCommit) => item.id, []);
  const rowHeight = useCallback(
    (index: number) => {
      return getRowHeight(commits[index], fontSize);
    },
    [commits, fontSize]
  );
  return (
    <VirtualList<FileCommit>
      ref={ref}
      items={commits}
      itemSize={rowHeight}
      getItemKey={getItemKey}
      onRowClick={onRowClick}
    >
      {renderRow}
    </VirtualList>
  );
};

export default forwardRef(FileCommitList);
