import { forwardRef, useCallback } from "react";
import { FileCommitListRow } from "./FileCommitListRow";
import { VirtualList, VirtualListEvents, VirtualListMethods } from "../VirtualList";
import { useTheme } from "@mui/material";

export interface FileCommitListProps extends VirtualListEvents<FileCommit> {
  commits: readonly FileCommit[];
  refs: Refs | undefined;
}

export const getRowHeight = (commit: FileCommit | undefined, baseFontSize: number) => {
  if (commit?.oldPath) {
    return baseFontSize * 4.75;
  } else {
    return baseFontSize * 3.25;
  }
};

export const getFileCommitListKey = (item: FileCommit) => item.id;

const FileCommitList_: React.ForwardRefRenderFunction<VirtualListMethods, FileCommitListProps> = (
  { commits, refs, ...rest },
  ref
) => {
  const theme = useTheme();
  const baseFontSize = theme.custom.baseFontSize;
  const renderRow = useCallback(
    ({ index, item }: { index: number; item: FileCommit }) => (
      <FileCommitListRow
        commit={item}
        index={index}
        head={item.id === refs?.head}
        refs={refs?.refsById[item.id]}
        height={getRowHeight(item, baseFontSize)}
      />
    ),
    [refs, baseFontSize]
  );
  const rowHeight = useCallback(
    (index: number) => {
      return getRowHeight(commits[index], baseFontSize);
    },
    [commits, baseFontSize]
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

export const FileCommitList = forwardRef(FileCommitList_);
