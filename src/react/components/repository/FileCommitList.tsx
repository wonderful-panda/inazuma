import { useTheme } from "@mui/material";
import { useCallback } from "react";
import { VirtualList, type VirtualListEvents, type VirtualListMethods } from "../VirtualList";
import { FileCommitListRow } from "./FileCommitListRow";

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

export const FileCommitList: React.FC<
  FileCommitListProps & { ref?: React.Ref<VirtualListMethods> }
> = ({ commits, refs, ref, ...rest }) => {
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
