import { useTheme } from "@mui/material";
import { useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import { VirtualList, type VirtualListEvents, type VirtualListMethods } from "../VirtualList";
import { FileCommitListRow } from "./FileCommitListRow";

export interface FileCommitListProps extends VirtualListEvents<FileCommit> {
  commits: readonly FileCommit[];
  refs: Refs | undefined;
  markedCommitId?: string;
}

export const getRowHeight = (commit: FileCommit | undefined, baseFontSize: number) => {
  if (commit?.oldPath) {
    return baseFontSize * 4.75;
  } else {
    return baseFontSize * 3.25;
  }
};

export const FileCommitList: React.FC<
  FileCommitListProps & { ref?: React.Ref<VirtualListMethods> }
> = ({ commits, refs, ref, markedCommitId, ...rest }) => {
  const theme = useTheme();
  const baseFontSize = theme.custom.baseFontSize;
  const renderRow = useCallback(
    ({ index, item }: { index: number; item: FileCommit }) => (
      <FileCommitListRow
        commit={item}
        index={index}
        markedCommitId={markedCommitId}
        refs={refs?.refsById[item.id]}
        height={getRowHeight(item, baseFontSize)}
      />
    ),
    [refs, baseFontSize, markedCommitId]
  );
  const rowHeight = useCallback(
    (index: number) => {
      return getRowHeight(commits[index], baseFontSize);
    },
    [commits, baseFontSize]
  );
  const selectedIndex = useSelectedIndex();
  const innerRef = useRef<VirtualListMethods>(null);
  useEffect(() => {
    innerRef.current?.scrollToItem(selectedIndex);
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    scrollToItem: (index: number) => {
      innerRef.current?.scrollToItem(index);
    }
  }));

  return (
    <VirtualList<FileCommit> ref={innerRef} items={commits} itemSize={rowHeight} {...rest}>
      {renderRow}
    </VirtualList>
  );
};
