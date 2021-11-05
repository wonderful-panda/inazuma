import { forwardRef, useCallback } from "react";
import FileCommitListRow from "./FileCommitListRow";
import VirtualList, { VirtualListEvents, VirtualListMethods } from "../VirtualList";

export interface FileCommitListProps extends VirtualListEvents<FileCommit> {
  commits: readonly FileCommit[];
  refs: Refs | undefined;
  fontSize: FontSize;
}

export const getRowHeight = (commit: FileCommit, fileSize: FontSize) => {
  if (fileSize === "medium") {
    return commit.oldPath ? 76 : 52;
  } else {
    return commit.oldPath ? 64 : 44;
  }
};

export const getFileCommitListKey = (item: FileCommit) => item.id;

const FileCommitList: React.ForwardRefRenderFunction<VirtualListMethods, FileCommitListProps> = (
  { commits, refs, fontSize, ...rest },
  ref
) => {
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
      getItemKey={getFileCommitListKey}
      {...rest}
    >
      {renderRow}
    </VirtualList>
  );
};

export default forwardRef(FileCommitList);
